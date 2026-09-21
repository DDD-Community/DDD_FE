import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { baseConfig } from "../../eslint.config.mjs";

/**
 * `eslint-config-next/typescript` 는 자체 `@typescript-eslint` 플러그인 인스턴스를
 * 등록한다. 루트 `baseConfig` 도 같은 이름으로 **다른** 인스턴스를 등록하는데,
 * flat config 는 동일 이름에 다른 객체가 오면
 * `Cannot redefine plugin "@typescript-eslint"` 로 실행 자체를 막는다.
 * (레포에 @typescript-eslint/eslint-plugin 8.56.1 / 8.62.1 두 버전이 설치돼 있다.)
 *
 * next 쪽 등록 하나만 남기고, baseConfig 에서는 플러그인 등록만 떼어낸다.
 * 규칙 이름은 양쪽이 같으므로 루트 규칙은 그대로 적용된다.
 */
const baseConfigWithoutTsPlugin = baseConfig.map((entry) => {
  if (!entry?.plugins?.["@typescript-eslint"]) return entry;

  const { plugins, ...rest } = entry;
  const otherPlugins = Object.fromEntries(
    Object.entries(plugins).filter(([name]) => name !== "@typescript-eslint"),
  );
  return Object.keys(otherPlugins).length > 0 ? { ...rest, plugins: otherPlugins } : rest;
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 루트 규칙을 next 프리셋 뒤에 둬서 모노레포 공통 규칙이 우선하도록 한다.
  ...baseConfigWithoutTsPlugin,
  // pdfjs-wasm 은 pdfjs-dist 에서 그대로 복사해온 서드파티 산출물이다(sync-pdfjs-wasm.mjs).
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/pdfjs-wasm/**"]),
]);

export default eslintConfig;
