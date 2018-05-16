import { PhotoType, PhotoWork } from '../models/Photo'

export type ModalType = 'diff' | 'export' | null
export type Route = '' | 'trash'

export default interface AppState {
    splashed: boolean
    importing: boolean
    /** The date filter, e.g. '2018-05-14' */
    currentDate: string | null
    currentTag: void  // TODO
    showOnlyFlagged: boolean
    /** The index of the currenlty selected photo. Is `-1` if no photo is selected.  */
    current: number
    currentPhotoWork: PhotoWork | null
    modal: ModalType
    settingsExists: boolean
    route: Route
    photosCount: number
    photos: PhotoType[]
    tags: void[]  // TODO
    devices: void[]  // TODO
    dates: { years: void[] } // TODO
    progress: { processed: number, total: number }
    highlighted: number[]
}
