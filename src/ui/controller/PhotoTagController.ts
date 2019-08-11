import { Photo, Tag } from 'common/CommonTypes'
import { assertRendererProcess } from 'common/util/ElectronUtil'
import { slug } from 'common/util/LangUtil'

import { fetchTagsAction, setPhotoTagsAction } from 'ui/state/actions'
import store from 'ui/state/store'
import BackgroundClient from 'ui/BackgroundClient'

import { updatePhotoWork } from './PhotoController'


assertRendererProcess()


export function setTags(tags: Tag[]) {
    store.dispatch(fetchTagsAction(tags))
}


export function fetchTags() {
    BackgroundClient.fetchTags()
        .then(tags => {
            setTags(tags)
        })
}


export async function setPhotoTags(photo: Photo, tags: string[]) {
    tags.sort((tag1, tag2) => slug(tag1) < slug(tag2) ? -1 : 1)

    store.dispatch(setPhotoTagsAction(photo.id, tags))

    const updatedTags = await BackgroundClient.storePhotoTags(photo.id, tags)

    if (updatedTags) {
        setTags(updatedTags)
    }

    updatePhotoWork(photo, photoWork => {
        if (!tags.length) {
            delete photoWork.tags
        } else {
            photoWork.tags = tags
        }
    })
}
