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

export function cloneDeep<T>(object: T): T {
    return JSON.parse(JSON.stringify(object)) as T
}

/**
 * Clones an array while removing one item.
 * 
 * If the array doesn't contain the item, the original array is returned (without cloning)
 * 
 * @param array the array where to remove the item
 * @param itemToRemove the item to remove
 * @param comparationAttribute the attribute to compare for finding the item to remove
 * @return the cloned array without `itemToRemove` or the original array if it doesn't contain `itemToRemove`
 */
export function cloneArrayWithItemRemoved<T, K extends keyof T>(array: T[], itemToRemove: T, comparationAttribute: K = null): T[] {
    let itemIndex: number
    if (comparationAttribute) {
        itemIndex = -1
        const attributeValueToRemove = itemToRemove[comparationAttribute]
        for (let i = 0, il = array.length; i < il; i++) {
            if (array[i][comparationAttribute] === attributeValueToRemove) {
                itemIndex = i
                break
            }
        }
    } else {
        itemIndex = array.indexOf(itemToRemove)
    }

    if (itemIndex === -1) {
        return array
    } else {
        return [
            ...array.slice(0, itemIndex),
            ...array.slice(itemIndex + 1)
        ]
    }
}


export function slug(text: string): string {
    return text.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
}
