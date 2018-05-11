import { PhotoType } from '../models/Photo'
import { DetailState } from './detail'

export default interface AppState {
    splashed: boolean
    importing: boolean
    currentDate: null  // TODO
    currentTag: null  // TODO
    showOnlyFlagged: boolean
    current: number
    detail: DetailState
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
