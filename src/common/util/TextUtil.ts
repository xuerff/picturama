const parsePathRegex = /^((.*)[/\\])?([^/\\]+?)$/

export interface PathParts {
    /** The directory. E.g. '/home/user/dir' */
    dir: string
    /** The base name. E.g. 'file.txt' */
    base: string
    /** The file name. E.g. 'file' */
    name: string
    /** The extension. E.g. '.txt' */
    ext: string
}

// Similar API like node's `path.parse`, but without dependency to node (so we can use it in renderer process)
export function parsePath(path: string): PathParts {
    const match = parsePathRegex.exec(path)
    if (!match) {
        // Should not happen
        throw new Error('Splitting path failed: ' + path)
    }

    const dir = match[2]
    const base = match[3]

    let name: string
    let ext: string
    const lastDotPos = base.lastIndexOf('.')
    if (lastDotPos <= 0) {
        // E.g. 'myfile' or '.private'
        name = base
        ext = ''
    } else {
        name = base.substr(0, lastDotPos)
        ext = base.substr(lastDotPos)
    }

    return {
        dir: dir == undefined ? '' : dir,
        base,
        name,
        ext
    }
}
