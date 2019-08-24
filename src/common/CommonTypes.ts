// ----- Database types -----


export type PhotoId = number
export interface Photo {
    id: PhotoId,
    /** The directory of the original image. Example: '/src/test-photos' */
    master_dir: string,
    /** The filename (without directory) of the original image. Example: 'IMG_9700.JPG' */
    master_filename: string,
    /** The width of the original image (in px). */
    master_width: number | null
    /** The height of the original image (in px). */
    master_height: number | null
    /** Whether the master image has a raw format */
    master_is_raw: 0 | 1,
    /** The timestamp when the photo was created */
    created_at: number,
    /** The timestamp when the photo was modified */
    updated_at: number,
    /** The timestamp when the photo was imported */
    imported_at: number,
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
    /** Whether the image is flagged. */
    flag: 0 | 1,
    /** Example: 0 */
    trashed: 0 | 1,
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


export interface Settings {
    photoDirs: string[]
    legacy?: {
        versionsDir?: string
    }
}


export interface UiConfig {
    platform: NodeJS.Platform
    locale: string
}

export type ImportProgress = {
    phase: 'scan-dirs' | 'cleanup' | 'import-photos' | 'error'
    /** Total number of photos found in file system */
    total: number
    /** Number of processed photos (photos which exist in file system and have been checked) */
    processed: number
    /** Number of photos added to the DB */
    added: number
    /** Number of photos removed from DB */
    removed: number
    /** The path of the directory which is currently scanned or processed */
    currentPath: string | null
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
}
export interface LoadedPhotoSection extends PhotoSection {
    photoIds: PhotoId[]
    photoData: PhotoById
}
export function isLoadedPhotoSection(section: PhotoSection | null | undefined | false): section is LoadedPhotoSection {
    return !!(section && (section as any).photoIds)
}
export type PhotoSectionById = { [K in PhotoSectionId]: PhotoSection | LoadedPhotoSection }


export type PhotoFilterType = 'all' | 'flagged' | 'processed' | 'trash' | 'tag'
export type PhotoFilter =
    { readonly type: 'all' } |
    { readonly type: 'flagged' } |
    { readonly type: 'trash' } |
    { readonly type: 'tag', readonly tagId: TagId }
    // TODO: Revive Legacy code of 'version' feature
    // -> Add 'processed'
