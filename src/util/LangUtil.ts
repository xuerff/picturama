export function bindMany(object: object, ...keys: string[]) {
    for (const key of keys) {
        const value = object[key]
        if (typeof value === 'function') {
            object[key] = value.bind(object)
        } else {
            throw new Error(`bindMany failed: '${key}' is no function`)
        }
    }
}
