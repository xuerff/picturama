// ----- Database types -----


export type PhotoId = string
export interface Photo {
    /** Example: 'B1m80éAMpf' */
    id: PhotoId,
    /** Example: 'IMG_9700' */
    title: string,
    /** The original image. Example: '/specs/photos/IMG_9700.JPG' */
    master: string,
    /** The width of the original image (in px). */
    master_width: number | null
    /** The height of the original image (in px). */
    master_height: number | null
    /** Contains non-raw version of raw images. Example: '../dot_ansel/thumbs/B1m80éAMpf.webp' */
    non_raw: string | null,
    /** Example: 'JPG' */
    extension: string,
    /** Whether the image is flagged. */
    flag: 0 | 1,
    /** Example: 0  (for saving Dates work too) */
    created_at: number | Date,
    /** Example: null */
    updated_at: number | null,
    /** Example: 1 (= ExifOrientation.Up) */
    orientation: ExifOrientation,
    /** Example: 'SONY DSC-N2' */
    camera?: string,
    /** Example: 0.0166 */
    exposure_time?: number,
    /** Example: 0 */
    iso?: number,
    /** Example: 5 */
    focal_length?: number,
    /** Example: 5.6 */
    aperture?: number,
    /** Example: '2016-09-18' */
    date?: string,
    /** Example: 0 */
    trashed: 0 | 1
}
export type PhotoById = { [K in PhotoId]: Photo }


export type TagId = number
export interface Tag {
    id: TagId
    title: string
    slug: string
    created_at: number
    updated_at: number | null
}
export type TagById = { [K in TagId]: Tag }


export type VersionId = number
export interface Version {
    id: VersionId
    type: string | null,
    master: string | null,
    output: string | null,
    thumbnail: string | null,
    version: number | null,
    photo_id: number | null,
}


// ----- Other types (not database) -----

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

/** See: src/usb.js */
export interface Device {
    id: any  // TODO
    type: 'usb-storage' | 'sd-card'
    name: string
    // TODO: Maybe there are more attributes. See src/usb.js
}


export interface PhotoDetail {
    versions: Version[],
    /** The tags attached to this photo. This may also contain new tags which don't exist in DB yet. */
    tags: string[]
}

export interface PhotoWork {
    rotationTurns?: 1 | 2 | 3
    flagged?: true
    tags?: string[]
}

export type PhotoSectionId = string
export interface PhotoSection {
    id: PhotoSectionId
    title: string
    count: number
    photoIds?: PhotoId[]
    photoData?: PhotoById
}
export type PhotoSectionById = { [K in PhotoSectionId]: PhotoSection }


export type PhotoFilter = {
    readonly mainFilter:
        { readonly type: 'tag', readonly tagId: TagId } |
        { readonly type: 'trash' } |
        { readonly type: 'processed' } |
        null
    readonly showOnlyFlagged: boolean
}
