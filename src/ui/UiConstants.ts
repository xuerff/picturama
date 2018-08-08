
export const isMac = process.platform === 'darwin'

const keySymbolMacCommand = '\u2318'
export const keySymbols = {
    macCommand: keySymbolMacCommand,
    macOption: '\u2325',
    shift: '\u21E7',
    tab: '\u21E5',
    return: '\u23CE',
    delete: '\u232B',
    ctrlOrMacCommand: isMac ? keySymbolMacCommand : 'Ctrl'
}
