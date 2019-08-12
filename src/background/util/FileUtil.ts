import fs, { PathLike } from 'fs'
import { promisify } from 'bluebird'


export const fsReadDir = promisify(fs.readdir)
export const fsReadFile = promisify(fs.readFile)
export const fsRename = promisify(fs.rename)
export const fsRmDir = promisify(fs.rmdir)
export const fsStat = promisify(fs.stat)
export const fsUnlink = promisify(fs.unlink)
export const fsWriteFile = promisify(fs.writeFile)


export async function fsExists(path: PathLike): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


export async function fsUnlinkIfExists(filePath: string): Promise<void> {
    if (filePath && await fsExists(filePath)) {
        await fsUnlink(filePath)
    }
}


export async function fsUnlinkDeep(path: PathLike): Promise<void> {
    const pathExists = await fsExists(path)
    if (!pathExists) {
        return
    }

    await fsUnlinkDeepNoExistsCheck(path)
}

async function fsUnlinkDeepNoExistsCheck(path: PathLike): Promise<void> {
    const stats = await fsStat(path)
    if (stats.isDirectory() && !stats.isSymbolicLink()) {
        const files = await fsReadDir(path)
        await Promise.all(files.map(file => fsUnlinkDeepNoExistsCheck(`${path}/${file}`)))
        await fsRmDir(path)
    } else {
        await fsUnlink(path)
    }
}
