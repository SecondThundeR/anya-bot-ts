module.exports = {
    proseWrap: 'always',
    tabWidth: 4,
    requireConfig: false,
    useTabs: false,
    trailingComma: 'none',
    bracketSpacing: true,
    semi: true,
    arrowParens: 'avoid',
    singleQuote: true,
    printWidth: 80,
    endOfLine: 'auto',
    overrides: [
        {
            files: ['*.json'],
            options: {
                parser: 'json'
            }
        }
    ],
    importOrder: ['^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true
};
