module.exports = {
    proseWrap: 'always',
    tabWidth: 4,
    requireConfig: false,
    useTabs: false,
    trailingComma: 'none',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    semi: true,
    arrowParens: 'avoid',
    singleQuote: true,
    printWidth: 80,
    svelteSortOrder: 'options-scripts-markup-styles',
    trailingComma: 'none',
    overrides: [
        {
            files: ['*.json'],
            options: {
                parser: 'json'
            }
        }
    ]
};
