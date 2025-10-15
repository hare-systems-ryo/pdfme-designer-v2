<script setup lang="ts">
/* ----------------------------------------------------------------------------
// File : app\components\editor\index.vue
// ----------------------------------------------------------------------------
// Component : Editor   
// search-key-word: EditorEditor
---------------------------------------------------------------------------- */

// ----------------------------------------------------------------------------
import { useFileDialog } from "@vueuse/core";
import { text, barcodes, image } from "@pdfme/schemas";
import { Designer } from "@pdfme/ui";
// ----------------------------------------------------------------------------
import { ObjectCopy, ObjectCompare } from "nuxt-hs-ui-next/utils/object";
import { Dayjs } from "nuxt-hs-ui-next/utils/dayjs";
import {
  type ModalControl,
  InitModalControl,
  InitModals,
} from "nuxt-hs-ui-next/utils/modal";
// ----------------------------------------------------------------------------
import { FileToText, FileToDataUrl } from "#shared/com/index";
// ----------------------------------------------------------------------------
import {
  GetFont,
  InitPdfTemplate,
  SetTemplateTypeSafe,
  type PdfTemplate,
  type PdfTemplateListRow,
  InitPdfTemplateMeta,
  type PdfTemplateMeta,
  InitPdfTemplateListRow,
} from "./_com";
// ----------------------------------------------------------------------------
const targetElm = ref<HTMLElement | null>(null);
// ----------------------------------------------------------------------------
const Toast = useHsToast();
// --------------------------------------------------------
const designer = shallowRef<Designer | null>(null);
// --------------------------------------------------------
const fileName = ref("sample");
const metaData = ref(InitPdfTemplateMeta());
const metaDiff = shallowRef(InitPdfTemplateMeta());
const templateData = ref(InitPdfTemplate());
const templateDiff = shallowRef(InitPdfTemplate());

/** データ更新の有無 */
const hasChange = computed(() => {
  return (
    !ObjectCompare(metaData.value, metaDiff.value) ||
    !ObjectCompare(templateData.value, templateDiff.value)
  );
});
const refleshTemplateData = () => {
  if (!designer.value) return;
  templateData.value = designer.value.getTemplate();
};
const setData = (template: PdfTemplate, meta: PdfTemplateMeta) => {
  metaData.value = ObjectCopy(meta);
  metaDiff.value = ObjectCopy(meta);
  templateData.value = ObjectCopy(template);
  templateDiff.value = ObjectCopy(template);
};

// --------------------------------------------------------
const plugins = {
  text: text,
  "QR Code": barcodes.qrcode,
  Image: image,
};
// --------------------------------------------------------
// const font = ref<any>(null);
const designerOption = ref<any>({
  font: null,
  lang: "ja",
  zoomLevel: 1,
  sidebarOpen: true,
});
// --------------------------------------------------------
// デザイナー系

/** デザイナーを生成 */
const generateDesigner = async () => {
  // // 初期化用フォントが取得完了していない場合があるためこちらでも取得処理を実行
  if (designerOption.value.font === null) {
    designerOption.value.font = await GetFont();
  }
  if (targetElm.value === null) {
    designer.value = null;
    throw new Error("Designer用のHTML Elementが捕捉できませんでした");
  }
  await designerDestroy();
  await nextTick();
  designer.value = new Designer({
    domContainer: targetElm.value,
    template: InitPdfTemplate(),
    options: ObjectCopy(designerOption.value),
    plugins,
  });

  /**
   * デザイナー側からのテンプレート変更イベント
   */
  (designer.value as any).onChangeTemplateCallback = (
    template: PdfTemplate
  ) => {
    templateData.value = ObjectCopy(template);
  };
};

const resetSchemas = (removeKeys: string[] | undefined = undefined) => {
  try {
    refleshTemplateData();
    const schemas = ObjectCopy(templateData.value.schemas);
    if (schemas.length === 0) return;
    const temp = {
      schema: schemas[0] ?? [],
    };
    if (removeKeys !== undefined) {
      // removeKey = (removeKey ?? "").replace(/0$/, "");
      removeKeys.forEach((removeKey) => {
        temp.schema = temp.schema.filter((row) => {
          if (removeKey + "0" === row.name) {
            return true;
          }
          if (removeKey === row.name.replace(/(.*)\d{1,}$/, "$1")) {
            return false;
          }
          return true;
        });
      });
    }
    const schemaKeys = temp.schema.map((row) => row.name);
    metaData.value.list.forEach((row) => {
      row.targetList.forEach((targetName) => {
        // 各リスト親要素の処理
        if (schemaKeys.includes(targetName) === false) {
          console.info("リストの基準要素が見つかりません。Name:" + targetName);
          return;
          // throw new Error("リストの基準要素が見つかりません。");
        }
        const baseKeyName = targetName.replace(/(.*)0$/, "$1");
        const base = temp.schema.find((row) => row.name === targetName);
        if (!base) return;
        // 既存該当要素の削除
        temp.schema = temp.schema.filter((row) => {
          if (baseKeyName === row.name.replace(/(.*)\d{1,}$/, "$1")) {
            return false;
          }
          return true;
        });
        // ここで生成する
        for (let i = 0; i < row.count; i++) {
          // if (i === 0) continue;
          const insertObj = ObjectCopy(base);
          insertObj.name = targetName.replace(/\d{1,}$/, String(i));
          insertObj.position.y = base.position.y + row.span * i;
          temp.schema.push(insertObj);
        }
      });
    });
    updateGeneratorTemplate(
      { ...templateData.value, schemas: [temp.schema] },
      false
    );
  } catch (err) {
    console.error("resetSchemas", err);
  }
};

/** デザイナーを破棄 */
const designerDestroy = async () => {
  if (designer.value !== null) {
    designer.value.destroy();
    designer.value = null;
  }
};

/** デザイナーを [ 引数:template ] で再描画 */
const updateGeneratorTemplate = (template: PdfTemplate, force = false) => {
  // if (!ObjectCompare(template, templateDataBefore.value) || force === true) {
  // templateDataBefore.value = ObjectCopy(template);
  if (designer.value !== null) {
    designer.value.updateTemplate(ObjectCopy(template));
  }
  // }
};

// --------------------------------------------------------
// List系

/**
 *  要素のうちListに含まれるもの
 */
const selectedItemList = computed<string[]>(() => {
  return metaData.value.list.reduce((ret, row) => {
    ret.push(...row.targetList);
    return ret;
  }, [] as string[]);
});

/**
 * List管理していないschema要素のリスト
 * - List管理化できる要素の名称に指定がある
 * - 名称ルール：「数値以外＋0」となっていること
 */
const unSelectedItemList = computed<{ id: string; text: string }[]>(() => {
  if (!designer.value) return [];
  // refleshTemplateData();
  const template = templateData.value;
  if (template.schemas.length === 0) return [];
  const schema = template.schemas[0];
  if (!schema) return [];
  const excludeList = selectedItemList.value;
  return schema
    .reduce((ret, row) => {
      if (row.type !== "text") return ret;
      if (/[^0-9０-９]0$/.test(row.name) && !excludeList.includes(row.name)) {
        ret.push({ id: row.name, text: row.name });
      }
      return ret;
    }, [] as { id: string; text: string }[])
    .sort((a, b) => {
      if (a.text > b.text) {
        return 1;
      } else if (a.text < b.text) {
        return -1;
      }
      return 0;
    });
});

// --------------------------------------------------------
/** リストグループを削除 */
const removeListItem = (row: PdfTemplateListRow, index: number) => {
  metaData.value.list = metaData.value.list.reduce((ret, row, i) => {
    if (index !== i) {
      ret.push(row);
    }
    return ret;
  }, [] as PdfTemplateListRow[]);
  resetSchemas(row.targetList.map((row) => row.replace(/0$/, "")));
};

/** リストグループの追加 */
const addListItem = () => {
  metaData.value.list.push(InitPdfTemplateListRow());
};
// --------------------------------------------------------

/** targetListに項目を追加する */
const targetListAdd = (row: PdfTemplateListRow, value: string | null) => {
  if (value === null) return;
  const list = ObjectCopy(row.targetList);
  list.push(value);
  row.targetList = list.sort();
  resetSchemas();
};

/** targetListに追加済の項目を削除する */
const targetListItemRemove = (row: PdfTemplateListRow, name: string) => {
  row.targetList = row.targetList.filter((key) => {
    if (key === name) {
      return false;
    } else {
      return true;
    }
  });
  // 既存該当要素の削除
  if (!designer.value) return;
  resetSchemas([name.replace(/0$/, "")]);
};

// --------------------------------------------------------
// --------------------------------------------------------
// ファイル操作系

// テンプレート変更
const { open: jsonFileSelect, onChange: onChangeJsonFileSelect } =
  useFileDialog({
    accept: ".json", // Set to accept only image files
    directory: false, // Select directories instead of files if set true
  });

onChangeJsonFileSelect(async (files) => {
  /** do something with files */
  if (!files || files?.length === 0) return;
  const file = files[0];
  if (!file) return;
  fileName.value = file.name.replace(/\.json$/, "");
  const text = await FileToText(file);
  const templateJson = JSON.parse(text);
  const { template, meta } = SetTemplateTypeSafe(templateJson);
  setData(template, meta);

  // setTemplate(template);
  updateGeneratorTemplate(template, true);
});

const { open: basePdfFileSelect, onChange: onChangeBasePdfSelect } =
  useFileDialog({
    accept: "application/pdf", // Set to accept only image files
    directory: false, // Select directories instead of files if set true
  });

// BasePDFの変更
onChangeBasePdfSelect(async (files) => {
  /** do something with files */
  if (!files || files?.length === 0) return;
  const file = files[0];
  if (!file) return;
  const dataUrl = await FileToDataUrl(file);
  if (!designer.value) return [];
  const template = designer.value.getTemplate();
  template.basePdf = dataUrl;
  updateGeneratorTemplate(template);
  generateDesigner();
});

const downloadTemplateJson = () => {
  if (!designer.value) return [];

  const template = designer.value.getTemplate();
  metaData.value.updateAt = Dayjs().format("");
  template.meta = metaData.value;
  const fileText = JSON.stringify(template, null, 3);
  const blob = new Blob([fileText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", fileName.value + ".json");
  a.click();
  setData(template, metaData.value);
};
// --------------------------------------------------------
// --------------------------------------------------------
onMounted(async () => {
  await nextTick();
  generateDesigner();
});
// --------------------------------------------------------
const overlayIsOpen = ref(false);
const openOverlay = () => {
  if (!designer.value) return;
  refleshTemplateData();
  overlayIsOpen.value = true;
};
const closeOverlay = () => {
  if (!designer.value) return;
  overlayIsOpen.value = false;
  resetSchemas();
};
const manualFlush = () => {
  refleshTemplateData();
  resetSchemas();
};

// --------------------------------------------------------
// [ Modal ]
interface Modal {
  typesDisplay: ModalControl;
}
const modal = reactive<Modal>({
  typesDisplay: InitModalControl(),
});
onMounted(() => InitModals(modal, nextTick));
modal.typesDisplay.showBefore = () => {
  manualFlush();
};

// --------------------------------------------------------
// 遷移ガード
onMounted(() => {
  const handler = (e: BeforeUnloadEvent) => {
    const hasUnsavedChanges = hasChange.value; //
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ""; // Chromeなどでは空文字でOK
    }
  };
  window.addEventListener("beforeunload", handler);
  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handler);
  });
});
</script>

<template>
  <div class="h-full relative">
    <div class="py-2 h-[60px] grid grid-cols-6 gap-2 px-2">
      <Btn
        theme="link"
        class="bg-white col-span-1"
        size="s"
        @click="jsonFileSelect"
      >
        テンプレート変更
      </Btn>
      <div class="col-span-1">
        <TextBox
          :data="fileName"
          label="ファイル名(.json)"
          :input-size="fileName.length"
          class="fileName"
        />
      </div>
      <Btn
        theme="link"
        class="bg-white col-span-1"
        size="s"
        @click="basePdfFileSelect"
      >
        <i class="fa-solid fa-file-pdf"></i>ベースPDF変更
      </Btn>
      <Btn
        theme="accent1"
        class="bg-white col-span-1"
        size="s"
        @click="manualFlush"
      >
        <i class="fa-solid fa-bolt"></i>反映
      </Btn>
      <Btn
        theme="download"
        class="bg-white col-span-1"
        size="s"
        :disabled="!hasChange"
        @click="downloadTemplateJson"
      >
        <i class="fa-solid fa-cloud-arrow-down"></i>ダウンロード
      </Btn>
      <Btn
        theme="link"
        class="bg-white col-span-1"
        size="s"
        @click="openOverlay()"
      >
        <i class="fa-solid fa-bars mr-3"></i>
        Menu
      </Btn>
    </div>
    <div ref="targetElm" class="h-full max-h-[calc(100%-70px)]"></div>
    <!--  -->
    <Teleport to="body">
      <div class="fixed bottom-0 left-0 p-2 bg-white/70 rounded-tr-md">
        <Btn
          variant="outlined"
          color="link"
          class="bg-white"
          size="s"
          @click.stop="modal.typesDisplay.show()"
        >
          型定義
        </Btn>
      </div>
      <div
        class="fixed inset-0 bg-blue-600/5"
        :class="overlayIsOpen ? '' : 'opacity-0 pointer-events-none'"
        @click.stop="closeOverlay()"
      ></div>
      <div
        class="fixed right-0 top-0 bottom-0 w-[400px] bg-back1 transition-all"
        :class="overlayIsOpen ? '' : 'translate-x-[100%]'"
      >
        <div class="p-2 flex flex-col max-h-full">
          <div class="flex-c gap-1">
            <Btn
              variant="outlined"
              theme="dark"
              class="bg-white w-[3em]"
              @click.stop="closeOverlay()"
            >
              <i class="fa-solid fa-angle-right"></i>
            </Btn>
            <div class="font-semibold ml-2">meta/リスト操作</div>
          </div>
          <div class="h-[1px] bg-main0 mt-2"></div>
          <div class="px-1 mt-2">備考</div>
          <div class="px-1">
            <Textarea v-model:data="metaData.note" />
          </div>
          <div class="h-[1px] bg-main0 my-4"></div>
          <div class="mt-">
            <Btn
              variant="outlined"
              theme="accent1"
              class="bg-white w-full"
              @click.stop="addListItem()"
            >
              リスト追加
            </Btn>
          </div>
          <div class="flex flex-col gap-4 mt-2 overflow-y-scroll">
            <template v-for="(row, index) in metaData.list" :key="index">
              <div class="list-group-item border-accent1 bg-theme2">
                <div class="flex gap-1 -group">
                  <Btn
                    variant="outlined"
                    color="accent1"
                    class="flex-none min-w-[2em] bg-white"
                    size=""
                    @click.stop="removeListItem(row, index)"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </Btn>
                  <ValueBox
                    v-model:data="row.count"
                    label="count"
                    :min="1"
                    :max="999"
                    :step="1"
                    :nullable="false"
                    :is-show-btn-control="true"
                    class="flex-1"
                    @warn="(message: string) => Toast.Error(message, '入力値エラー', 2500)"
                    @value-change="resetSchemas()"
                  />
                  <ValueBox
                    v-model:data="row.span"
                    label="span"
                    :min="0"
                    :max="50"
                    :step="0.01"
                    :nullable="false"
                    unit="mm"
                    :digits="2"
                    :is-show-btn-control="true"
                    class="flex-1"
                    @value-change="resetSchemas()"
                    @warn="(message: string) => Toast.Error(message, '入力値エラー', 2500)"
                  />
                </div>
                <Select
                  :data="null"
                  class="mt-1"
                  label="リスト対象追加"
                  :require="false"
                  :disabled="unSelectedItemList.length === 0"
                  :list="unSelectedItemList"
                  @update:data="(value) => targetListAdd(row, value)"
                />
                <ul
                  v-if="row.targetList.length > 0"
                  class="flex flex-col gap-0 mt-1 ml-4 bg-white border border-main2"
                >
                  <div
                    v-for="(targetName, index2) in row.targetList"
                    :key="index2"
                    class="flex-c px-2 cursor-pointer hover:bg-error/10"
                    :class="index2 !== 0 ? 'border-t border-main1 ' : ''"
                    @click="targetListItemRemove(row, targetName)"
                  >
                    <div class="flex-1">{{ targetName }}</div>
                    <span class="px-2 py-1 text-error">
                      <i class="fa-solid fa-xmark"></i>
                    </span>
                  </div>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
    <EditorTypesDisplay
      :modal-control="modal.typesDisplay"
      :template="templateData"
    />
  </div>
</template>

<style lang="scss">
.fileName .icons {
  flex: 1 1 auto;
}
</style>
