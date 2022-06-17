// eslint-disable-next-line no-undef
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:jest/recommended'
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
        'react-hooks/exhaustive-deps': 0,
        'prettier/prettier': 'warn',
        camelcase: 'error',
        'jest/expect-expect': 0,
        'jest/no-standalone-expect': 0,
        'jest/valid-title': [
            'warn',
            {
                mustMatch: {
                    it: '^Should'
                }
            }
        ]
    },
    ignorePatterns: ['dist']
};
