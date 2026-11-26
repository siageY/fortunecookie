/**
 * build.js - Netlify 배포용 정적 파일 준비
 *
 * src/ 의 화면 파일과 data/fortunes.json 만 dist/ 로 복사한다.
 * (.env, 서버 코드, AI DB 는 배포 결과물에 포함하지 않는다)
 */

const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(root, "src"), dist, {
  recursive: true,
  filter: (filePath) => path.basename(filePath) !== ".DS_Store",
});

fs.mkdirSync(path.join(dist, "data"), { recursive: true });
fs.copyFileSync(
  path.join(root, "data", "fortunes.json"),
  path.join(dist, "data", "fortunes.json")
);

console.log("Netlify publish 디렉터리 준비 완료: dist/");
