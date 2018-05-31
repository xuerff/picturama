
// Bookshelf API see: http://bookshelfjs.org/

export interface BookshelfClass<Fields, ExtraApi = {}> {
    new (where?: Partial<Fields>): Fields & BookshelfModel<Fields> & ExtraApi
    forge(data: Partial<Fields>)
}

export interface BookshelfModel<Fields> {
    where(whereClause: object): this
    fetch(options?: any): Promise<this>
    save(): Promise<this>
    save(fieldName: string, newValue: any, options?: any): Promise<this>
    toJSON(): Fields
}

export type BookshelfId = number

export interface BookshelfCollection<Fields> {
    attach(ids: BookshelfId | BookshelfModel<Fields> | BookshelfId[] | BookshelfModel<Fields>[], options?: any): Promise<this>
}

/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }
