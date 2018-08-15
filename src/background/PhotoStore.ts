import DB from 'sqlite3-helper'

import { PhotoId, PhotoDetail } from '../common/models/Photo'
import { TagType } from '../common/models/Tag'
import { VersionType } from '../common/models/Version'


export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    return Promise.all([
        DB().query<TagType>('select * from tags where id in (select tag_id from photos_tags where photo_id = ?) order by slug', photoId),
        DB().query<VersionType>('select * from versions where photo_id = ? order by version', photoId)
    ])
    .then(results => {
        const [ tags, versions ] = results
        return { tags, versions } as PhotoDetail
    })

    // TODO
    //const lastVersion = photo.versions[photo.versions.length - 1]
    //photo.thumb = lastVersion.output || photo.thumb
}
