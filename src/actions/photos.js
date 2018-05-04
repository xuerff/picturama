import Photo from '../models/Photo'

export const getPhotos = () => dispatch => {
  Photo
    .where({ trashed: false })
    .count()
    .then(count => {
      Photo
        .query(qb => {
          qb
            .limit(100)
            .offset(0)
            .where({ trashed: false })
            .orderBy('created_at', 'desc');
        })
        .fetchAll({ withRelated: [ 'versions', 'tags' ] })
        .then(photos => {
          dispatch({
            type: 'GET_PHOTOS_SUCCESS',
            photos: photos.toJSON(),
            count: count
          });
        });
    });
};

export const updatedPhoto = (e, version) => dispatch => {
  new Photo({ id: version.attributes.photo_id })
    .fetch({ withRelated: [ 'versions', 'tags' ] })
    .then(photo => {
      dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photo.toJSON() });
    });
};

export const moveToTrash = photo => dispatch => {
  new Photo({ id: photo.id })
    .save('trashed', true, { patch: true })
    .then(() => new Photo({ id: photo.id })
        .fetch({ withRelated: [ 'versions', 'tags' ] })
    )
    .then(photoModel => {
      dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photoModel.toJSON() });
    });
};

export const getTrashed = () => dispatch => {
  new Photo()
    .where({ trashed: 1 })
    .fetchAll({ withRelated: [ 'versions', 'tags' ] })
    .then(photos => {
      dispatch({
        type: 'GET_PHOTOS_SUCCESS',
        photos: photos.toJSON(),
        route: 'trash'
      });
    });
};

export const removePhotos = (e, ids) => dispatch => {
  dispatch({ type: 'ON_REMOVED_PHOTOS', ids });
};
