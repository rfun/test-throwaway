// Mock upstream for the schedule feed. Behaviour is driven by chaos.json.
import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const chaos = JSON.parse(fs.readFileSync(new URL("../chaos.json", import.meta.url), "utf8"));
const port = Number(process.env.PORT ?? 8089);
const fixture = fs.readFileSync(new URL(`../fixtures/${chaos.fixture}.json`, import.meta.url));
let calls = 0;

function handler(req, res) {
  if (req.url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  calls += 1;
  if (chaos.mode === "429" && calls <= (chaos.failFirst || 2)) {
    res.writeHead(429, { "Retry-After": "1", "Content-Type": "text/plain" });
    return res.end("rate limited");
  }
  if (chaos.mode === "auth") {
    res.writeHead(401, { "Content-Type": "text/plain" });
    return res.end("invalid token");
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(fixture);
}

const server = chaos.mode === "tls-expired"
  ? https.createServer({ key: fs.readFileSync(".certs/key.pem"), cert: fs.readFileSync(".certs/cert.pem") }, handler)
  : http.createServer(handler);
server.listen(port, "127.0.0.1", () => console.log(`mock upstream (${chaos.mode}, ${chaos.fixture}) on ${port}`));
