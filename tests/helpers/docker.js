// Bouwt de productie-container, start hem lokaal en draait de testset er tegenaan.
// Gebruik: npm run test:docker  (extra argumenten gaan door naar playwright test)
const { execSync, spawnSync } = require("node:child_process");

const image = "clickfarm:test";
const name = `clickfarm-test-${process.pid}`;
const port = process.env.DOCKER_PORT || "8090";
const baseURL = `http://localhost:${port}`;

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

async function waitForHealth() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${baseURL}/healthz`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Container niet gezond op ${baseURL}/healthz`);
}

(async () => {
  let status = 1;
  try {
    run(`docker build -t ${image} .`);
    run(`docker run -d --rm --name ${name} -p ${port}:8080 ${image}`);
    await waitForHealth();
    const result = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: { ...process.env, BASE_URL: baseURL },
    });
    status = result.status ?? 1;
  } finally {
    spawnSync("docker", ["stop", name], { stdio: "ignore" });
  }
  process.exit(status);
})();
