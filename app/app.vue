<script setup lang="ts">
/* ----------------------------------------------------------------------------
// File : app\app.vue
---------------------------------------------------------------------------- */

// ----------------------------------------------------------------------------
import { DayjsFormat, DayjsInit } from "nuxt-hs-ui-next/utils/dayjs";
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
DayjsInit();
// ----------------------------------------------------------------------------
const hsIsMobile = useHsIsMobile();
onMounted(() => hsIsMobile.init());
useHead({
  meta: [
    { "http-equiv": "refresh", content: "" },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0,maximum-scale=1.0",
    },
    { name: "format-detection", content: "telephone=no" },
    { name: "theme-color", content: "#183C5E" },
    { name: "apple-mobile-web-app-title", content: "LogiNavi" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { name: "mobile-web-app-capable", content: "yes" },
  ],
  link: [
    // ---------------------------------------------------
    {
      rel: "stylesheet",
      href: "/assets/plugin/font-awesome/css/regular.min.css",
    },
    {
      rel: "stylesheet",
      href: "/assets/plugin/font-awesome/css/solid.min.css",
    },
    // ---------------------------------------------------
    // Google Fonts
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?" +
        [
          "family=Noto+Sans+JP:wght@400;500;700", // JPは重いので必要最小限に
          "display=swap", // FOIT防止、初回からシステムフォント表示→あとで置換
        ].join("&"),
    },
  ],
  bodyAttrs: {
    class: () => {
      return [hsIsMobile.isIPhone ? "ios-safari" : ""].join(" ");
    },
  },
});

// ---------------------------------------------------
// [ stores ]
const hsMisc = useHsMisc();
onMounted(() => {});
const { public: pConfig } = useRuntimeConfig();

onMounted(async () => {
  const ts = DayjsFormat(pConfig.startAt, "YYYY-MM-DD HH:mm");
  console.info(
    `${pConfig.app.nameKey} [ v.${pConfig.app.version} ]  ${ts}  ${pConfig.app.env}`
  );
  hsMisc.init();
});
</script>

<template>
  <Teleport to="body">
    <Toast />
    <WindowLoader />
    <ModalBg />
    <Dialog />
  </Teleport>
  <NuxtPage />
</template>
