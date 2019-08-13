const parsePathRegex = /^((.*)[/\\])?([^/\\]+?)$/

export interface PathParts {
    /** The directory. E.g. '/home/user/dir' */
    dir: string
    /** The base name. E.g. 'file.txt' */
    base: string
    /** The file name. E.g. 'file' */
    name: string
    /** The extension. E.g. 'txt' (Please note: node.js would use '.txt') */
    ext: string
}

// Similar API like node's `path.parse`, but without dependency to node (so we can use it in renderer process)
export function parsePath(path: string, targetParts?: PathParts): PathParts {
    const match = parsePathRegex.exec(path)
    if (!match) {
        // Should not happen
        throw new Error('Splitting path failed: ' + path)
    }

    const dir = match[2]
    const base = match[3]

    if (!targetParts) {
        targetParts = {} as PathParts
    }

    targetParts.dir = dir == undefined ? '' : dir
    parseFilename(base, targetParts)

    return targetParts
}


export interface FilenameParts {
    /** The base name. E.g. 'file.txt' */
    base: string
    /** The file name. E.g. 'file' */
    name: string
    /** The extension. E.g. 'txt' */
    ext: string
}

export function parseFilename(filename: string, targetParts?: FilenameParts): FilenameParts {
    if (!targetParts) {
        targetParts = {} as FilenameParts
    }

    targetParts.base = filename
    const lastDotPos = filename.lastIndexOf('.')
    if (lastDotPos <= 0) {
        // E.g. 'myfile' or '.private'
        targetParts.name = filename
        targetParts.ext = ''
    } else {
        targetParts.name = filename.substr(0, lastDotPos)
        targetParts.ext = filename.substr(lastDotPos + 1)
    }

    return targetParts
}
