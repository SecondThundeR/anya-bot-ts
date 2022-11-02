module.exports = {
    proseWrap: 'always',
    tabWidth: 4,
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
    importOrder: [
        '^@groupCommands/(.*)$',
        '^@pmCommands/(.*)$',
        '^@groupHandlers/(.*)$',
        '^@pmHandlers/(.*)$',
        '^@enums/(.*)$',
        '^@locale/(.*)$',
        '^@utils/(.*)$',
        '^[./]'
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true
};
