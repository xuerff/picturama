import Promise from 'bluebird';

import Photo from './../models/photo';

export const toggleFlagged = (date, showOnlyFlagged) => {
  let where = { flag: showOnlyFlagged };

  if (date) where.date = date;

  return (dispatch) => {
    new Photo()
      .where(where)
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ 
          type: 'GET_PHOTOS_SUCCESS', 
          photos: photos.toJSON(),
          showOnlyFlagged
        });
      });
  };
};

export const getFlagged = () => {
  return (dispatch) => {
    new Photo()
      .where({ flag: true })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ type: 'GET_PHOTOS_SUCCESS', photos: photos.toJSON() });
      });
  };
};

export const toggleFlag = (photo) => {
  console.log('toggle flag', photo);
  return (dispatch) => {
    new Photo({ id: photo.id })
      .save('flag', !photo.flag, { patch: true })
      .then(() => {
        return new Photo({ id: photo.id })
          .fetch({ withRelated: ['versions', 'tags'] });
      })
      .then((photoModel) => {
        dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photoModel.toJSON() });
      });
  };
};

export const flagSet = (photos, flaggedPhotos, flag) => {
  return (dispatch) => {
    Promise.each(flaggedPhotos, (photo) => {
      return new Photo({ id: photo.id })
        .save('flag', flag, { patch: true });
    })
    .then(() => {
      return photos;
    })
    .map((photo) => {
      return new Photo({ id: photo.id })
        .fetch({ withRelated: ['versions', 'tags'] })
        .then((photo) => photo.toJSON());
    })
    .then((photos) => {
      dispatch({ 
        type: 'GET_PHOTOS_SUCCESS', 
        photos: photos
      });
    });
  };
};
