
export interface BookshelfClass<Fields> {
    new (where?: Partial<Fields>): Fields & BookshelfModel<Fields>
    forge(data: Partial<Fields>)
}

export interface BookshelfModel<Fields> {
    fetch(): Promise<Fields>
    save()
}

/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }
