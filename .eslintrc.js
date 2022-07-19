// eslint-disable-next-line no-undef
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/no-explicit-any': 0,
        'default-case': 'error',
        'prettier/prettier': 'warn',
        camelcase: 'error'
    },
    ignorePatterns: ['dist']
};
