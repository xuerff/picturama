import fs, { PathLike, Dirent, WriteFileOptions } from 'fs'
import BluebirdPromise, { promisify } from 'bluebird'


export const fsMkDir = promisify(fs.mkdir)
export const fsReadDir: (path: PathLike, options?: { encoding?: string, withFileTypes?: false }) => BluebirdPromise<string[]> = promisify(fs.readdir)
export const fsReadFile = promisify(fs.readFile) as
    {
        (path: PathLike | number): BluebirdPromise<Buffer>
        (path: PathLike | number, options: { encoding?: null; flag?: string; } | undefined | null): BluebirdPromise<Buffer>
        (path: PathLike | number, options: { encoding: string; flag?: string; } | string): BluebirdPromise<string>
    }
export const fsRename = promisify(fs.rename)
export const fsRmDir = promisify(fs.rmdir)
export const fsStat = promisify(fs.stat)
export const fsUnlink = promisify(fs.unlink)
export const fsUtimes = promisify(fs.utimes)
export const fsWriteFile = promisify(fs.writeFile) as
    {
        (path: PathLike | number, data: any, options: WriteFileOptions): BluebirdPromise<void>
        (path: PathLike | number, data: any): BluebirdPromise<void>
    }


export function fsReadDirWithFileTypes(path: PathLike, options?: { encoding?: string }): BluebirdPromise<Dirent[]> {
    return fsReadDir(path, { ...options, withFileTypes: true } as any) as any
}


export async function fsExists(path: PathLike): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


export async function fsMkDirIfNotExists(path: PathLike): Promise<void> {
    if (!await fsExists(path)) {
        await fsMkDir(path)
    }
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
