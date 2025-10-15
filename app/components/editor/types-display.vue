<script setup lang="ts">
/* ----------------------------------------------------------------------------
// File : app\components\editor\types-display.vue
// ----------------------------------------------------------------------------
// Component : EditorTypesDisplay   
// search-key-word: EditorTypesDisplayEditorTypesDisplay
---------------------------------------------------------------------------- */

// [ nuxt-hs-ui ]
import type { ModalControl } from "nuxt-hs-ui-next/utils/modal";

import type { PdfTemplate } from "~/components/editor/_com";
import { CopyText } from "~/components-lib/com";

interface Props {
  modalControl: ModalControl;
  template: PdfTemplate;
}
const props = withDefaults(defineProps<Props>(), {});

const keys = computed(() => {
  const schemas = props.template.schemas;
  if (schemas.length === 0) return [];
  const schema = schemas[0];
  if (!schema) return [];
  return schema
    .reduce((ret, row) => {
      if (!["text", "qrcode"].includes(row.type)) return ret;
      ret.push(row.name);
      return ret;
    }, [] as string[])
    .sort();
});

const interfaceText = computed(() => {
  const interfaceText = `/* ----------------------------------------------------------------------------
// File :  _types.ts
---------------------------------------------------------------------------- */

export type InputRow = {
\t${keys.value.map((row) => `'${row}': string;`).join("\n\t")}
};

export type Inputs = InputRow[];

export const InitInputRow = () :InputRow => {
  return {
\t\t${keys.value.map((row) => `'${row}': ` + "``,").join("\n\t\t")}
  };
};`;
  return interfaceText;
});

const rows = computed(() => interfaceText.value.split("\n").length);
</script>

<template>
  <Modal
    :show="props.modalControl.isShow"
    closeable
    :mounted="false"
    @close="props.modalControl.close()"
  >
    <Card ref="modalElm" class="h-full max-w-full w-[1200px]">
      <CardItem
        variant="header"
        class="bg-main1"
        size="s"
        cross
        @update:open="props.modalControl.close()"
      >
        <span class="fs-5"> Types </span>
      </CardItem>
      <div class="h-[1px] bg-white flex-none"></div>
      <CardItem variant="body" class="bg-back1">
        <Btn
          theme="accent1"
          class="bg-white col-span-1"
          size="s"
          @click="CopyText(interfaceText)"
        >
          <i class="fa-solid fa-clipboard-check"></i>クリップボードにCopy
        </Btn>
      </CardItem>
      <CardItem variant="body" class="bg-back1" scroll>
        <Textarea :data="interfaceText" :rows="rows" class="h-full"></Textarea>
      </CardItem>
    </Card>
  </Modal>
</template>
