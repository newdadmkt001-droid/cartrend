/* ============================================================
 * cartrend 정적 서버 (의존성 없음 · Node 내장 http만 사용)
 * - 견적은 클라이언트(lib/quote-engine.js)에서 계산 → 서버 API 불필요
 * - 스크래핑/수집(/api/collect) 및 Playwright 제거됨
 * - 이 서버는 단순 정적 파일 서빙용. file://로 직접 열어도 동작함.
 * 실행: npm start  (기본 포트 3001)
 * ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2"
};

const server = http.createServer(function (req, res) {
  var urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  // 경로 탈출 방지
  var filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath.indexOf(ROOT) !== 0) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, function (err, data) {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("404 Not Found"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      // 항상 최신본 제공 — 브라우저가 옛 data.js/스크립트를 재사용하지 않도록
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log("cartrend 정적 서버 실행: http://localhost:" + PORT + "  (admin: /admin.html)");
});
