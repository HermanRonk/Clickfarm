// Bouwt de productie-container, start hem lokaal en draait de testset er tegenaan.
// Gebruik: npm run test:docker  (extra argumenten gaan door naar playwright test)
const { execSync, spawnSync } = require("node:child_process");

const image = "clickfarm:test";
const name = `clickfarm-test-${process.pid}`;
const port = process.env.DOCKER_PORT || "8090";
const baseURL = `http://localhost:${port}`;
// Tweede en derde container: met (testwaarden voor) Umami-statistieken, en met een ongeldige ID
const umamiPort = String(+port + 1);
const umamiBadPort = String(+port + 2);
const umami = {
  UMAMI_HOST: "https://stats.example.org",
  UMAMI_WEBSITE_ID: "00000000-1111-2222-3333-444444444444",
  UMAMI_DOMAINS: "clickfarm.nl",
};
const envArgs = (env) => Object.entries(env).map(([k, v]) => `-e ${k}='${v}'`).join(" ");

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

async function waitForHealth(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${url}/healthz`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Container niet gezond op ${url}/healthz`);
}

(async () => {
  let status = 1;
  try {
    run(`docker build -t ${image} .`);
    run(`docker run -d --rm --name ${name} -p ${port}:8080 ${image}`);
    run(`docker run -d --rm --name ${name}-umami -p ${umamiPort}:8080 ${envArgs(umami)} ${image}`);
    run(
      `docker run -d --rm --name ${name}-umami-bad -p ${umamiBadPort}:8080 ${envArgs({ ...umami, UMAMI_WEBSITE_ID: '"><script>' })} ${image}`
    );
    const umamiURL = `http://localhost:${umamiPort}`;
    const umamiBadURL = `http://localhost:${umamiBadPort}`;
    await Promise.all([waitForHealth(baseURL), waitForHealth(umamiURL), waitForHealth(umamiBadURL)]);
    const result = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: {
        ...process.env,
        BASE_URL: baseURL,
        UMAMI_BASE_URL: umamiURL,
        UMAMI_BAD_BASE_URL: umamiBadURL,
        UMAMI_HOST: umami.UMAMI_HOST,
        UMAMI_WEBSITE_ID: umami.UMAMI_WEBSITE_ID,
      },
    });
    status = result.status ?? 1;
  } finally {
    for (const n of [name, `${name}-umami`, `${name}-umami-bad`]) spawnSync("docker", ["stop", n], { stdio: "ignore" });
  }
  process.exit(status);
})();
