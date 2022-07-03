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
        'quotes': [2, 'single', {'avoidEscape': true}],
        'semi': [2, 'never'],
        'vue/no-unused-vars': 'error',
        'vue/multi-word-component-names': 'off',
        'vue/first-attribute-linebreak': ['error', {
            'singleline': 'ignore',
            'multiline': 'below'
        }],
        'vue/max-attributes-per-line': ['error', {
            'singleline': {
                'max': 2
            },
            'multiline': {
                'max': 1
            }
        }],
        indent: 'error',
    },
    overrides: [
        {
            files: ['*.html'],
            processor: 'vue/.vue',
        },
    ],
}
