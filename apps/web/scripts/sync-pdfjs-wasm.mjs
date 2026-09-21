/**
 * pdfjs-dist 의 wasm 디코더를 `public/pdfjs-wasm/` 으로 복사한다.
 *
 * pdf.js 는 JPEG 2000(JPXDecode)·JBIG2 이미지와 ICC 색 프로파일을 wasm 으로 디코딩한다.
 * wasm 을 찾지 못하면 예외를 던지지 않고 경고만 남긴 뒤 해당 이미지를 건너뛰므로,
 * 그런 이미지로만 이뤄진 발표 자료는 "로드는 성공했는데 전 페이지가 백지" 로 보인다.
 *
 * 번들러를 태우지 않는 이유: pdf.js 가 받는 `wasmUrl` 은 파일이 아니라 디렉터리 경로이고,
 * 워커 안에서 파일명을 이어 붙여 직접 fetch 한다. webpack 의 asset import 로는 해시가 붙은
 * 개별 파일만 나오므로, 원본 파일명이 그대로 유지되는 `public/` 이 유일한 선택지다.
 *
 * 결과물은 커밋한다. 배포처가 이 스크립트를 태우지 않아도 wasm 이 따라가야 하는데,
 * 없으면 위에 적은 대로 조용히 백지가 되어 아무도 모르고 넘어가기 때문이다.
 * pdfjs-dist 버전을 올리면 이 스크립트를 다시 돌려 diff 를 같이 커밋한다.
 */
import { createRequire } from "node:module";
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 커밋하는 파일이라 실제로 쓰는 것만 남긴다.
 *
 * - `quickjs-eval.*` — PDF 폼의 JavaScript 실행용. `enableScripting` 을 켜야 쓰는데 우리는 뷰어다.
 * - `*_nowasm_fallback.js` — wasm 을 못 받았을 때의 asm.js 대체본. 둘이 합쳐 600KB 인데,
 *   같은 경로에서 wasm 을 받는 이상 이쪽만 성공할 상황이 없다.
 */
const EXCLUDED = [/^quickjs-eval\./, /_nowasm_fallback\.js$/];

const require = createRequire(import.meta.url);
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const source = join(dirname(require.resolve("pdfjs-dist/package.json")), "wasm");
const destination = join(packageRoot, "public", "pdfjs-wasm");

// 버전을 올리면 없어진 파일이 남을 수 있다. 통째로 지우고 다시 깐다.
rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, {
  recursive: true,
  filter: (from) => !EXCLUDED.some((pattern) => pattern.test(from.slice(source.length + 1))),
});
