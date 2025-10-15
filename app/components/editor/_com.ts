/* ----------------------------------------------------------------------------
// File : app\components\editor\_com.ts
// ----------------------------------------------------------------------------
// [ app > components > editor > * ]
import {} from '~/components/editor/_com';
----------------------------------------------------------------------------- */

// import { Template, Designer, Form, Viewer } from '@pdfme/ui';
// import type { Template } from "@pdfme/common";
import { type Template, BLANK_A4_PDF } from "@pdfme/common";

export const FontName = {
  ipag: "ipag.ttf",
  ipagp: "ipagp.ttf",
} as const;

export const GetFont = async () => {
  const { public: pConfig } = useRuntimeConfig();
  const baseurl = pConfig.url + "/assets/font/";
  return {
    ipag: {
      data: baseurl + FontName.ipag,
      fallback: true,
    },
    ipagp: {
      data: baseurl + FontName.ipagp,
    },
  };
};

export interface PdfTemplateListRow {
  targetList: string[];
  span: number;
  count: number;
}

export const InitPdfTemplateListRow = (): PdfTemplateListRow => {
  return {
    targetList: [],
    span: 10,
    count: 1,
  };
};

export interface PdfTemplateMeta {
  note: string;
  updateAt: string | null;
  list: PdfTemplateListRow[];
}
export const InitPdfTemplateMeta = (): PdfTemplateMeta => {
  return {
    note: "",
    updateAt: null,
    list: [],
  };
};

export interface PdfTemplate extends Template {
  basePdf: any;
  // meta: {
  //   note: string;
  //   updateAt: string | null;
  //   list: PdfTemplateListRow[];
  // };
}

export const InitPdfTemplate = (arg?: {
  fileName?: string;
  fontName?: string;
  basePdf?: string;
}): PdfTemplate => {
  // const fileName = arg?.fileName ?? null;
  // const fontName = arg?.fileName ?? "ipag";
  const basePdf = arg?.basePdf ?? {
    width: 210,
    height: 297,
    padding: [0, 0, 0, 0],
  };
  return {
    meta: {
      note: "",
      updateAt: null,
      list: [],
    },
    basePdf: basePdf,
    schemas: [[]],
    // columns: undefined,
    // sampledata: undefined,
    pdfmeVersion: "5.4.1",
  };
};

/**
 * 任意のテンプレートデータを型チェックして適切な状態で返却する
 */
export const SetTemplateTypeSafe = (
  _template: any
): { template: PdfTemplate; meta: PdfTemplateMeta } => {
  const template = InitPdfTemplate();
  const meta = InitPdfTemplateMeta();
  // note: string;
  // updateAt: string | null;
  // list: PdfTemplateListRow[];
  if ("basePdf" in _template) {
    template.basePdf = _template.basePdf;
  }
  if ("schemas" in _template) {
    template.schemas = _template.schemas;
  }
  if ("meta" in _template) {
    if ("note" in _template.meta) {
      meta.note = _template.meta.note;
    }
    if ("updateAt" in _template.meta) {
      meta.updateAt = _template.meta.updateAt;
    }
    if ("list" in _template.meta) {
      meta.list = _template.meta.list;
    }
  }
  return { template, meta };
};
