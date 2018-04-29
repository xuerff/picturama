import * as Promise from 'bluebird'

import Photo from './../models/photo';

export const toggleFlagged = (date, showOnlyFlagged) => {
  let where = { flag: showOnlyFlagged, trashed: 0 };

  if (date) where.date = date;

  return dispatch => {
    new Photo()
      .where(where)
      .fetchAll({ withRelated: [ 'versions', 'tags' ] })
      .then(photos => {
        dispatch({
          type: 'GET_PHOTOS_SUCCESS',
          photos: photos.toJSON(),
          showOnlyFlagged
        });
      });
  };
};

export const getFlagged = () => dispatch => {
  new Photo()
    .where({ flag: true, trashed: 0 })
    .fetchAll({ withRelated: [ 'versions', 'tags' ] })
    .then(photos => {
      dispatch({ type: 'GET_PHOTOS_SUCCESS', photos: photos.toJSON() });
    });
};

export const toggleFlag = photo => dispatch => {
  new Photo({ id: photo.id })
    .save('flag', !photo.flag, { patch: true })
    .then(() => new Photo({ id: photo.id })
      .fetch({ withRelated: [ 'versions', 'tags' ] })
    )
    .then(photoModel => {
      dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photoModel.toJSON() });
    });
};

export const flagSet = (photos, flaggedPhotos, flag) => dispatch => {
  Promise.each(flaggedPhotos, photo =>
    new Photo({ id: photo.id })
      .save('flag', flag, { patch: true })
  )
  .then(() => photos)
  .map(photo => new Photo({ id: photo.id })
      .where({ trashed: 0 })
      .fetch({ withRelated: [ 'versions', 'tags' ] })
      .then(photo => photo.toJSON())
  )
  .then(photos => {
    dispatch({
      type: 'GET_PHOTOS_SUCCESS',
      photos: photos
    });
  });
};
