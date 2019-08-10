
/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }


export interface UiConfig {
    locale: string
}

export type ImportProgress = {
    processed: number
    total: number
    photosDir: string | null
}
