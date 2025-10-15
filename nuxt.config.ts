// https://nuxt.com/docs/api/configuration/nuxt-config
import dayjs from "dayjs/esm/index";
import p from "./package.json";
import { execSync } from "child_process";
try {
  const npmVersion = execSync("npm -v").toString().trim();
  console.info(
    `nuxt.config.ts run!  node-v: ${process.version}   npm-v:${npmVersion}`
  );
} catch (err) {
  console.error(err);
}
// ----------------------------------------------------------------------------
const env: "development" | "staging" | "production" = (() => {
  const e = String(process.env.APP_ENV);
  if (e === "development") return e;
  if (e === "staging") return e;
  if (e === "production") return e;
  return "development";
})();
const startAt = dayjs().format();

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  sourcemap: {
    server: false,
    client: false,
  },
  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: parseInt(process.env.APP_PORT || "80", 10),
  },
  colorMode: {
    preference: "light", // デフォルトをlightに固定
    fallback: "light", // SSR時のフォールバック
    classSuffix: "", // 'dark-mode'ではなく'dark'クラスを使う
  },
  build: {
    // モジュールをトランスパイル対象にして Vite が中を素通りしないように
    transpile: ["nuxt-hs-ui-next"],
  },
  features: {
    inlineStyles: true,
  },
  vite: {
    // 依存最適化から除外（pre-bundleで #build を追わないように）
    optimizeDeps: { exclude: ["nuxt-hs-ui-next"] },
    // SSRバンドル時は外部化しない（必要に応じて）
    ssr: { noExternal: ["nuxt-hs-ui-next"] },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    [
      "nuxt-hs-ui-next",
      {
        theme: {
          main0: "#183C5E",
          main1: "#2C5A85",
          main2: "#487CB4",
          main3: "#A7CDED",
          main4: "#C4E1FF",
          accent1: "#FF6600",
          accent2: "#FFAC7C",
          info: "#2BABB5",
          link: "#6200EE",
          download: "#11691F",
          success: "#2BB60C",
          warn: "#EAB000",
          error: "#D80329",
          dark: "#224466",
          back: "#EDEDED",
          back1: "#EDEDED",
          back2: "#AABED1",
          white: "#FFFFFF",
        },
      },
    ],
  ],
  nitro: {
    preset: "node-server",
    ignore: [
      "app/**/_*", // app直下の _* を無視
      "app/**/_*/**", // app直下の _* ディレクトリ以下を無視
      "server/api/**/_*/**", // API以下の _* ディレクトリを無視
      "server/api/**/_*", // API以下の _* ファイルを無視
    ],
  },
  css: ["./app/assets/main.css"],
  runtimeConfig: {
    // const { server: sConfig, public: pConfig } = useRuntimeConfig();
    server: {},
    // const { public: pConfig } = useRuntimeConfig();
    public: {
      startAt,
      url: String(process.env.APP_URL) || "",
      app: {
        nameKey: String(process.env.APP_NAME_KEY),
        version: String(p.version),
        env: env,
      },
      // ----------------------------------------------------------------------------
    },
  },
});
