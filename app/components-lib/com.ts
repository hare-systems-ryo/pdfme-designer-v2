/* ----------------------------------------------------------------------------
// File : app\components-lib\com.ts
// ----------------------------------------------------------------------------
// [ app > components-lib > * ]
import {} from '~/components-lib/com';
----------------------------------------------------------------------------- */

export const CopyText = async (
  text: string,
  showToast = true
): Promise<boolean> => {
  // Nuxt 等の SSR で安全に
  if (!import.meta.client) return false;
  if (typeof window === "undefined" || typeof document === "undefined")
    return false;
  const Toast = useHsToast();
  // 1) まずはモダンな API
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      if (showToast) Toast.Info("Copy", "", 1000);
      return true;
    }
  } catch {
    // 失敗時はフォールバックへ
  }

  // 2) フォールバック: 一時 textarea + execCommand
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  // 画面スクロールや再レイアウトを防ぐ
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  ta.style.opacity = "0";

  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length); // iOS 対策

  let ok = false;
  try {
    ok = document.execCommand("copy");
    if (showToast) Toast.Info("Copy", "", 1000);
  } finally {
    document.body.removeChild(ta);
  }
  return ok;
};
