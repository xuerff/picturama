import DB from 'sqlite3-helper'

import { PhotoId, PhotoType, PhotoDetail, PhotoFilter, PhotoSection, PhotoSectionId } from '../common/models/Photo'
import { TagType } from '../common/models/Tag'
import { VersionType } from '../common/models/Version'


export async function fetchSections(filter: PhotoFilter): Promise<PhotoSection[]> {
    const filterWhere = createWhereForFilter(filter)
    const sql = `select date as id, date as title, count(*) as count from photos where ${filterWhere.sql} group by date order by date desc`
    return await DB().query<PhotoSection>(sql, ...filterWhere.params)
}


export async function fetchSectionPhotos(sectionId: PhotoSectionId, filter: PhotoFilter): Promise<PhotoType[]> {
    const filterWhere = createWhereForFilter(filter)
    const sql = `select * from photos where date = ? and ${filterWhere.sql} order by created_at asc`
    return await DB().query<PhotoType>(sql, sectionId, ...filterWhere.params)
}


function createWhereForFilter(filter: PhotoFilter): { sql: string, params: any[] } {
    const mainFilter = filter.mainFilter

    let sql = 'trashed = ?'
    let params: any[] = [
        (mainFilter && mainFilter.type === 'trash') ? 1 : 0  // trashed
    ]

    if (mainFilter && mainFilter.type === 'tag') {
        sql += ' and id in (select photo_id from photos_tags where tag_id = ?)'
        params.push(mainFilter.tagId)
    } else if (mainFilter && mainFilter.type === 'date') {
        sql += ' and date = ?'
        params.push(mainFilter.date)
    }

    if (filter.showOnlyFlagged) {
        sql += ' and flag = 1'
    }

    return { sql, params }
}


export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    const [ tags, versions ] = await Promise.all([
        DB().query<TagType>('select * from tags where id in (select tag_id from photos_tags where photo_id = ?) order by slug', photoId),
        DB().query<VersionType>('select * from versions where photo_id = ? order by version', photoId)
    ])

    return { tags, versions } as PhotoDetail

    // TODO
    //const lastVersion = photo.versions[photo.versions.length - 1]
    //photo.non_raw = lastVersion.output || photo.non_raw
}


export async function updatePhotos(photoIds: PhotoId[], update: Partial<PhotoType>): Promise<void> {
    await Promise.all(photoIds.map(photoId =>
        DB().update<PhotoType>('photos', update, photoId)
    ))
}
