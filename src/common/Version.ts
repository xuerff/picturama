
// TODO: Revive Legacy code of 'version' feature
/*
import anselBookshelf from './ansel-bookshelf'
import { copy as fsCopy } from 'fs.extra'
import Promise from 'bluebird'
import sharp from 'sharp'
import libraw from 'libraw'

import config from '../config'

import Photo from './Photo'
import { BookshelfClass } from '../DataTypes'


const copy = Promise.promisify(fsCopy) as ((fromPath: string, toPath: string) => Promise<void>)

const Version = anselBookshelf.Model.extend({
    tableName: 'versions',

    photo: function() {
        this.belongsTo(Photo)
    },

    initialize: function() {
        this.on('creating', model => new Photo({ id: model.get('photo_id') })
            .fetch()
            .then(photoModel => {
                const photo = photoModel.toJSON()

                let fileName = [
                    photo.title,
                    photo.id,
                    model.get('version')
                ].join('-')

                if (model.get('type') === 'RAW') {
                    let fileNamePath = `${config.tmp}/${fileName}.${photo.extension}`

                    model.set('master', fileNamePath)

                    return copy(photo.master, fileNamePath)
                }

                let fileNamePath = `${config.tmp}/${fileName}`

                model.set('master', `${fileNamePath}.tiff`)

                return libraw.extract(photo.master, fileNamePath)
                    .then(output => {
                        model.set('master', output)
                        return output
                    })
            })
            .catch(err => {
                console.error('ERR', err)
            }))
    }
}, {
    updateImage(data) {
        let filename = [ data[1], data[2], data[3] ].join('-')
        let thumbPathName = `${config.thumbnailPath}/${filename}.jpg`

        return sharp(data.input)
            .resize(250, 250)
            ['max']()
            .toFile(thumbPathName)
            .then(() => Version.where({ photo_id: data[2], version: data[3] })
                    .fetch()
            )
            .then(version => {
                if (version) {
                    return version.save(
                        { output: data.input, thumbnail: thumbPathName },
                        { method: 'update' }
                    )
                }
    
                throw new Error('not-found')
            })
            .catch(err => {
                console.error(err)
                return null
            })
    }
}) as BookshelfClass<VersionType>

export default Version
*/
