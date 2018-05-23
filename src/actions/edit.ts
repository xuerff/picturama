import { PhotoType, PhotoEffect } from '../models/Photo'
import { storePhotoWork, storeThumbnail } from '../BackgroundClient'
import { renderThumbnailForPhoto } from '../renderer/ThumbnailRenderer'


export const storeEffects = (photo: PhotoType, effects: PhotoEffect[]) => dispatch => {
    // We do all in parallel:
    //   - Show the new effects in UI
    //   - Store PhotoWork to ansel.json
    //   - Update Thumbnail

    dispatch({
        type: 'EDIT_EFFECTS_CHANGE',
        photoId: photo.id,
        effects
    })

    storePhotoWork(photo.master, { effects })
        .catch(error => console.log('Storing photo failed: ' + photo.master, error))  // TODO: Show error message in UI

    renderThumbnailForPhoto(photo, effects)
        .then(thumbnailData => storeThumbnail(photo.thumb_250, thumbnailData))
        .then(() => window.dispatchEvent(new CustomEvent('edit:thumnailChange', { detail: { photoId: photo.id } })))
        .catch(error => console.log('Rendering thumbnail failed: ' + photo.master, error))  // TODO: Show error message in UI
}
