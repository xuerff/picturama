import { PhotoEffect } from '../models/Photo'


export const editEffectsChange = (photoId: string, effects: PhotoEffect[]) => dispatch => {
    dispatch({
        type: 'EDIT_EFFECTS_CHANGE',
        photoId,
        effects
    })
}
