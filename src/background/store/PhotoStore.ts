import DB from 'sqlite3-helper/no-generators'

import { PhotoId, Photo, PhotoDetail, PhotoFilter, PhotoSection, PhotoSectionId, Version } from 'common/CommonTypes'


export async function fetchTotalPhotoCount(): Promise<number> {
    const photoCount = await DB().queryFirstCell<number>('select count(*) from photos;')
    return photoCount!
}


export async function fetchSections(filter: PhotoFilter): Promise<PhotoSection[]> {
    const filterWhere = createWhereForFilter(filter)
    const sql = `select date as id, date as title, count(*) as count from photos where ${filterWhere.sql} group by date order by date desc`
    return await DB().query<PhotoSection>(sql, ...filterWhere.params)
}


export async function fetchSectionPhotos(sectionId: PhotoSectionId, filter: PhotoFilter): Promise<Photo[]> {
    const filterWhere = createWhereForFilter(filter)
    const sql = `select * from photos where date = ? and ${filterWhere.sql} order by created_at asc`
    return await DB().query<Photo>(sql, sectionId, ...filterWhere.params)
}


function createWhereForFilter(filter: PhotoFilter): { sql: string, params: any[] } {
    let sql = 'trashed = ?'
    let params: any[] = [
        (filter.type === 'trash') ? 1 : 0
    ]

    if (filter.type === 'flagged') {
        sql += ' and flag = 1'
    }

    if (filter.type === 'tag') {
        sql += ' and id in (select photo_id from photos_tags where tag_id = ?)'
        params.push(filter.tagId)
    }

    return { sql, params }
}


export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    const [ tags, versions ] = await Promise.all([
        DB().queryColumn<string>('title', 'select title from tags where id in (select tag_id from photos_tags where photo_id = ?) order by slug', photoId),
        DB().query<Version>('select * from versions where photo_id = ? order by version', photoId)
    ])

    return { tags, versions } as PhotoDetail

    // TODO: Revive Legacy code of 'version' feature
    //const lastVersion = photo.versions[photo.versions.length - 1]
    //photo.non_raw = lastVersion.output || photo.non_raw
}


export async function updatePhotos(photoIds: PhotoId[], update: Partial<Photo>): Promise<void> {
    await Promise.all(photoIds.map(photoId =>
        DB().update<Photo>('photos', update, [ 'id = ?', photoId ])
    ))
}
