import { QueryInterface } from 'knex'
import { counters } from 'sharp';


// Bookshelf API see: http://bookshelfjs.org/

export interface BookshelfClass<Fields, ExtraApi = {}> {
    new (where?: Partial<Fields>): Fields & BookshelfModel<Fields> & ExtraApi
    forge(attributes?: Partial<Fields>, options?: any): BookshelfModel<Fields>
    where(whereClause: object): BookshelfModel<Fields>
}

export type BookshelfSaveOptions = {
    transacting?: any
    method?: 'update' | 'insert'
    /** Default value: `false` */
    defaults?: boolean
    /** Default value: `false` */
    patch?: boolean
    /** Default value: `true` */
    require?: boolean
}

export interface BookshelfModel<Fields> {
    attributes: Fields
    where(whereClause: object): this
    query(...args: any[]): this
    distinct(...args: any[]): QueryInterface
    fetch(options?: any): Promise<this>
    fetchAll(options?: any): Promise<BookshelfCollection<Fields>>
    count(): Promise<number>
    save(): Promise<this>
    save(fieldName: string, newValue: any, options?: BookshelfSaveOptions): Promise<this>
    save(attrs: Partial<Fields>, options?: BookshelfSaveOptions): Promise<this>
    toJSON(): Fields
}

export type BookshelfId = number

export interface BookshelfCollection<Fields> {
    attach(ids: BookshelfId | BookshelfModel<Fields> | BookshelfId[] | BookshelfModel<Fields>[], options?: any): Promise<this>
    toJSON(): Fields[]
}

/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }

/** See: src/usb.js */
export interface Device {
    id: any  // TODO
    type: 'usb-storage' | 'sd-card'
    name: string
    // TODO: Maybe there are more attributes. See src/usb.js
}
