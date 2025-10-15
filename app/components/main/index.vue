<script setup lang="ts">
/* ----------------------------------------------------------------------------
// File : app\components\main\index.vue
// ----------------------------------------------------------------------------
// Component : Main   
// search-key-word: MainMain
---------------------------------------------------------------------------- */
</script>

<template>
  <Card ref="modalElm" class="w-full h-screen">
    <CardItem class="bg-main2 text-white h-[40px]" variant="header">
      PDFME Editor
    </CardItem>
    <CardItem variant="body" class="h-[calc(100%-40px)] p-0" scroll>
      <ClientOnly>
        <Editor />
      </ClientOnly>
    </CardItem>
  </Card>
</template>
