export function encodeSqlString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`
}

export function toSqlStringCsv(values: string[]): string {
    return values.map(value => encodeSqlString(value)).join(', ')
}
