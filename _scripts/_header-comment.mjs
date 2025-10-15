/* ----------------------------------------------------------------------------
// File : _scripts/_header-comment.mjs
----------------------------------------------------------------------------- */

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

// ----------------------------------------------------------------------------

const dir = [
  "app", //
  "shared", //
  "server", //
];
// ----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const baseDir = path.dirname(__filename);
const rootDir = path.dirname(baseDir);
const sep = path.sep;
// ----------------------------------------------------------------------------
// const __dirname = import.meta.filename;
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const listFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.error("存在しないPathが指定されました : \n - " + dirPath);
    return [];
  }
  const files = [];
  const paths = fs.readdirSync(dirPath);
  for (let name of paths) {
    try {
      const _path = `${dirPath}${sep}${name}`;
      const stat = fs.statSync(_path);
      switch (true) {
        case stat.isFile():
          files.push(_path);
          break;
        case stat.isDirectory():
          files.push(...listFiles(_path));
          break;
        default:
      }
    } catch (err) {
      console.error("error:", err.message);
    }
  }
  return files;
};
// ----------------------------------------------------------------------------
let updateCounter = 0;
const excludePath = [
  // チェック対象外ファイルはここに設置する
];
const fileCheck = (path) => {
  // console.log(path);
  if (!fs.existsSync(path)) {
    console.error("存在しないPathが指定されました" + path);
    return;
  }
  const rPath = path
    .replace(rootDir, "")
    .replace(/^[/\\]/, "")
    .replace(/\\/g, "/");
  // console.log('対象ファイル：vue  :: vueComponents', rPath);
  if (excludePath.includes(rPath)) return;
  if (!/\.(:?ts|vue)$/.test(rPath)) return;
  const state = {
    textBefore: fs.readFileSync(path, { encoding: "utf-8" }),
    textAfter: "",
  };
  if (/\.ts$/.test(rPath)) {
    if (/^server[\\/]api[\\/]/.test(rPath)) {
      state.textAfter = tsServer(rPath, state.textBefore);
    } else {
      state.textAfter = tsNormal(rPath, state.textBefore);
    }
  } else if (/\.vue$/.test(rPath)) {
    if (/^app[\\/]components[\\/]/.test(rPath)) {
      state.textAfter = vueComponents(rPath, state.textBefore);
    } else {
      state.textAfter = vueSimple(rPath, state.textBefore);
    }
  } else {
    console.info("対象外以外", rPath);
    return;
  }
  const fileName =
    rPath
      .split("/")
      .filter((row, index, list) => list.length === index + 1)[0] || "";
  state.textAfter = state.textAfter
    .replace(/\r\n/g, "\n")
    .replace(
      /^\/\/ *const ctRoot = `[^$].*`;/m,
      `// const ctRoot = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^const ctRoot = `[^$].*`;/m,
      `const ctRoot = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^\/\/ *export const ctRoot = `[^$].*`;/m,
      `// export const ctRoot = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^export const ctRoot = `[^$].*`;/m,
      `export const ctRoot = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^const ct = `[^$].*`;/m,
      `const ct = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^\/\/ *const ct = `[^$].*`;/m,
      `// const ct = \`${rPath.replace(/\//g, ":")}\`;`
    )
    .replace(
      /^const ctRoot = `[^$].*`;/m,
      `const ctRoot = \`${rPath
        .replace(/\//g, ":")
        .replace(/\/.*(:?\.ts|\.vue)/g, "")}\`;`
    )
    .replace(
      /^const ct = `\$\{ctRoot\}.*/m,
      `const ct = \`$\{ctRoot}${fileName}\`;`
    );

  if (state.textAfter.length !== 0 && state.textBefore !== state.textAfter) {
    updateCounter++;
    console.info(`Update : ${rPath}`);
    fs.writeFileSync(path, state.textAfter, { encoding: "utf8" });
  }
};

// ----------------------------------------------------------------------------

const tsNormal = (rPath, textBefore) => {
  const breadcrumb =
    rPath
      .split("/")
      .filter((row, index, list) => {
        return list.length !== index + 1;
      })
      .join(" > ") || "";
  const prefix = (() => {
    if (/^app/.test(rPath)) return "~/";
    if (/^server/.test(rPath)) return "~~/";
    if (/^shared/.test(rPath)) return "#";
    return "~~/";
  })();
  const header = `/* ----------------------------------------------------------------------------
// File : ${rPath.replace(/\//g, "\\")}
// ----------------------------------------------------------------------------
// [ ${breadcrumb} > * ]
import {} from '${prefix}${rPath.replace(/\.ts/, "").replace(/^app\//, "")}';
----------------------------------------------------------------------------- */`;
  const after = textBefore.replace(/^\s*\/\*[\s\S]*?\*\//, header);
  return after;
};

const tsServer = (rPath, textBefore) => {
  const prefix = (() => {
    if (/^app/.test(rPath)) return "~/";
    if (/^server/.test(rPath)) return "~~/";
    if (/^shared/.test(rPath)) return "#";
    return "~~/";
  })();
  const isApi = /\nexport default defineEventHandler\(/.test(textBefore);
  const url = rPath
    .replace(/^server\//g, "")
    .replace(/\.ts$/g, "")
    .replace(/\.post$/g, "")
    .replace(/\.get$/g, "")
    .replace(/\.put$/g, "")
    .replace(/\.delete$/g, "")
    .replace(/index$/g, "");
  const header = `/* ----------------------------------------------------------------------------
// File : ${rPath.replace(/\//g, "\\")}
// ----------------------------------------------------------------------------${
    isApi ? `\nexport const ApiUrl = \`/${url}\`;` : ""
  }
import {} from '${prefix}${rPath.replace(/\.ts/, "")}';
----------------------------------------------------------------------------- */`;
  const after = textBefore.replace(/^\s*\/\*[\s\S]*?\*\//, header);
  return after;
};

const vueComponents = (rPath, textBefore) => {
  const ComponentName =
    rPath
      .replace(/^app\/components\//, "")
      .replace(/\/index\.vue$/g, "")
      .replace(/\//g, "-")
      .split("-")
      // .filter((row, index) => index !== 0)
      .map((row) => row.replace(/\.vue$/, ""))
      .map((row) => capitalizeFirst(row))
      .join("") || "";

  const header = `/* ----------------------------------------------------------------------------
// File : ${rPath.replace(/\//g, "\\")}
// ----------------------------------------------------------------------------
// Component : ${ComponentName}   
// search-key-word: ${ComponentName}${ComponentName}
---------------------------------------------------------------------------- */`;
  return textBefore.replace(/^(.*\n)\s*\/\*[\s\S]*?\*\//, "$1" + header);
};

const vueSimple = (rPath, textBefore) => {
  const header = `/* ----------------------------------------------------------------------------
// File : ${rPath.replace(/\//g, "\\")}
---------------------------------------------------------------------------- */`;
  return textBefore.replace(/^(.*\n)\s*\/\*[\s\S]*?\*\//, "$1" + header);
};

// ----------------------------------------------------------------------------
let totalFileCount = 0;
const taskComment = () => {
  console.info("[File Comment Check] Run");
  console.info(
    dir
      .map(
        (row, index, list) =>
          `${index + 1 === list.length ? "  └ " : "  ├ "}${row.replace(
            /^\.\./,
            ""
          )}`
      )
      .join("\n")
  );
  console.info("");
  const count = dir.length;
  for (let i = 0; i < count; i++) {
    const p = rootDir + path.sep + dir[i];
    const list = listFiles(p);
    totalFileCount += list.length;
    list.forEach((filePath) => {
      fileCheck(filePath);
    });
  }
  console.info("");
  console.info(
    `[File Comment Check] Fin.  UPD:${updateCounter} TotalFile:${totalFileCount}`
  );
  console.info("");
};
taskComment();
