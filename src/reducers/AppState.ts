import { PhotoType, PhotoWork } from '../models/Photo'

export default interface AppState {
    splashed: boolean
    importing: boolean
    currentDate: null  // TODO
    currentTag: null  // TODO
    showOnlyFlagged: boolean
    /** The index of the currenlty selected photo. Is `-1` if no photo is selected.  */
    current: number
    currentPhotoWork: PhotoWork | null
    diff: boolean
    settingsExists: boolean
    route: ''
    photosCount: number
    photos: PhotoType[]
    tags: any[]  // TODO
    devices: any[]  // TODO
    dates: { years: any[] } // TODO
    progress: { processed: number, total: number }
    highlighted: any[]  // TODO
}
