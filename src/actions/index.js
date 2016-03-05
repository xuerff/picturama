import Photo from './../models/photo';
import Tag from './../models/tag';

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

export const startImport = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_IMPORT', status: true });
  };
};

export const importProgress = (e, progress) => {
  return (dispatch) => {
    dispatch({ type: 'SET_IMPORT_PROGRESS', progress });
  };
};

export const updatedPhoto = (e, version) => {
  return (dispatch) => {
    new Photo({ id: version.attributes.photo_id })
      .fetch({ withRelated: ['versions', 'tags'] })
      .then((photo) => {
        dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photo.toJSON() });
      });
  };
};

export const toggleFlag = (photo) => {
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

export const setTagFilter = (tag) => {
  return (dispatch) => {
    new Tag({ id: tag.id })
      .fetch({ withRelated: ['photos'] })
      .then((tag) => {
        let photos = tag.related('photos');

        dispatch({ 
          type: 'GET_PHOTOS_SUCCESS', 
          photos: photos.toJSON()
        });
      });
  };
};
