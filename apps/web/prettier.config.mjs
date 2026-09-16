/** @type {import('prettier').Config} */
export default {
    plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
    singleQuote: true,

    importOrder: [
        '^react$',
        '^react/(.*)$',
        '<BUILTIN_MODULES>',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@/(.*)$',
        '',
        '^[./]',
    ],

    tailwindStylesheet: './src/styles/index.css',
};
