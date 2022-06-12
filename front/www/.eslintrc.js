module.exports = {
    root: true,
    env: {
        node: true,
        'vue/setup-compiler-macros': true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: {
            ts: '@typescript-eslint/parser',
            '<template>': 'espree',
        },
    },
    plugins: ['@typescript-eslint', 'vue'],
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-essential',
        'plugin:vue/vue3-strongly-recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        'vue/no-unused-vars': 'error',
        'vue/multi-word-component-names': 'off',
        indent: 'error',
    },
    overrides: [
        {
            files: ['*.html'],
            processor: 'vue/.vue',
        },
    ],
}
