import fs from 'fs'
import { promisify } from 'bluebird'


export const fsReadDir = promisify(fs.readdir)
export const fsReadFile = promisify(fs.readFile)
export const fsRename = promisify(fs.rename)
export const fsStat = promisify(fs.stat)
export const fsUnlink = promisify(fs.unlink)
export const fsWriteFile = promisify<void, string, any>(fs.writeFile)


export async function fsExists(path: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


export async function fsUnlinkIfExists(filePath: string): Promise<void> {
    if (filePath && await fsExists(filePath)) {
        await fsUnlink(filePath)
    }
}
