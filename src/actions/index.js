import Photo from './../models/photo';

export const getPhotos = () => {
  return (dispatch) => {
    Photo
      .query(function (qb) {
        qb.limit(100).offset(0).orderBy('created_at', 'desc');
      })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ type: 'GET_PHOTOS_SUCCESS', photos: photos.toJSON() });
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

export const getProcessed = () => {
  return (dispatch) => {
    Photo.forge()
      .query((q) => {
        q.join('versions', 'versions.photo_id', '=', 'photos.id');
      })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ type: 'GET_PHOTOS_SUCCESS', photos: photos.toJSON() });
      });
  };
};

export const setDateFilter = (date) => {
  return (dispatch) => {
    new Photo()
      .where({ date: date })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ 
          type: 'GET_PHOTOS_SUCCESS', 
          photos: photos.toJSON(),
          date: date
        });
      });
  };
};

export const getDates = () => {
  return (dispatch) => {
    Photo.getDates().then((dates) => {
      dispatch({ type: 'GET_DATES_SUCCESS', dates });
    });
  };
};

export const setImport = (status) => {
  return (dispatch) => {
    dispatch({ type: 'SET_IMPORT', status });
  };
};
