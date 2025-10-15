// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import stylistic from '@stylistic/eslint-plugin';
const nuxt = await withNuxt();

export default [
  ...nuxt,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // --- Vue ---
      // <slot/> などで怒られたくないなら normal: 'any' に
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'any', component: 'any' },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/html-indent': 'off',
      'vue/require-default-prop': 'off',
      // --- TypeScript ESLint ---
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-namespace': 'off',
      // 画面の警告にあった “_ で無視” を反映
      '@typescript-eslint/no-unused-vars': ['off'],
      // --- Stylistic ---
      '@stylistic/arrow-parens': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
          multilineDetection: 'brackets',
        },
      ],
      '@stylistic/quote-props': 'off',
      '@stylistic/brace-style': 'off',

      // --- Nuxt（未実装なら off のままで無害）---
      'nuxt/nuxt-config-keys-order': 'off',
      // --- その他 ---
      'no-unused-vars': 'off',
    },
  },
];
