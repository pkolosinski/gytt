/** @type {import('prettier').Config} */
export default {
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  singleQuote: true,

  importOrder: [
    '^react.*$',
    '',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '^[.]',
  ],
  importOrderCaseSensitive: false,

  tailwindStylesheet: './src/styles/index.css',
};
