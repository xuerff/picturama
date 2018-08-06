import { PhotoType, PhotoWork } from '../models/Photo'
import { TagId, TagType } from '../models/Tag'

export type ModalType = 'diff' | 'export' | null
export type Route = '' | 'trash'

export default interface AppState {
    splashed: boolean
    importing: boolean
    /** The date filter, e.g. '2018-05-14' */
    currentDate: string | null
    currentTag: TagId
    showOnlyFlagged: boolean
    /** The index of the currenlty selected photo. Is `-1` if no photo is selected.  */
    current: number
    currentPhotoWork: PhotoWork | null
    modal: ModalType
    settingsExists: boolean
    route: Route
    photosCount: number
    photos: PhotoType[]
    tags: TagType[]
    devices: { readonly name: string }[]
    dates: { readonly years: { readonly id: string, readonly months: { readonly id: string, readonly days: { readonly id: string }[] }[] }[] }
    progress: { processed: number, total: number }
    highlighted: number[]
}
