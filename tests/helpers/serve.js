// Minimale statische webserver voor de tests (zonder extra dependencies).
// Serveert dezelfde bestanden als de container: index.html, info.html, favicon.ico, css/ en inc/.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const port = Number(process.env.PORT) || 8081;
const allowed = [/^\/index\.html$/, /^\/info\.html$/, /^\/favicon\.ico$/, /^\/css\/[\w.-]+$/, /^\/inc\/[\w.-]+$/];
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    if (urlPath === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok\n");
    }
    if (!allowed.some((re) => re.test(urlPath))) {
      res.writeHead(404);
      return res.end("Not found");
    }
    fs.readFile(path.join(root, urlPath), (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(urlPath)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Clickfarm test server op http://localhost:${port}`));
