
// Bookshelf API see: http://bookshelfjs.org/

export interface BookshelfClass<Fields, ExtraApi = {}> {
    new (where?: Partial<Fields>): Fields & BookshelfModel<Fields> & ExtraApi
    forge(data: Partial<Fields>)
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
    where(whereClause: object): this
    fetch(options?: any): Promise<this>
    save(): Promise<this>
    save(fieldName: string, newValue: any, options?: BookshelfSaveOptions): Promise<this>
    save(attrs: Partial<Fields>, options?: BookshelfSaveOptions): Promise<this>
    toJSON(): Fields
}

export type BookshelfId = number

export interface BookshelfCollection<Fields> {
    attach(ids: BookshelfId | BookshelfModel<Fields> | BookshelfId[] | BookshelfModel<Fields>[], options?: any): Promise<this>
}

/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }
