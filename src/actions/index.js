import Promise from 'bluebird';
import fs from 'fs';

import config from './../config';
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
    //.then((photoIds) => {
    //  new Photo.where('id', 'IN', photoIds)
    //    .fetchAll({ withRelated: ['versions', 'tags'] });
    //})
    .then((photos) => {
      dispatch({ 
        type: 'GET_PHOTOS_SUCCESS', 
        photos: photos
      });
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
          photos: photos.toJSON(),
          tagId: tag.id
        });
      });
  };
};

export const getTags = () => {
  return (dispatch) => {
    new Tag()
      .query((q) => q.orderBy('slug', 'ASC'))
      .fetchAll()
      .then((tags) => {
        dispatch({ type: 'GET_TAGS_SUCCESS', tags: tags.toJSON() });
      });
  };
};

export const createTagsAndAssociateToPhoto = (tags, photoId) => {
  return (dispatch) => {
    new Photo({ id: photoId }).fetch().then((photo) => {
      // TODO: Remove all the previous tag before adding the new one
      return Promise.map(tags, (tagName) => {
        return new Tag({ title: tagName })
          .fetch()
          .then((tag) => {
            console.log('fetched tag', tag);
            if (tag)
              return tag;
            else
              return new Tag({ title: tagName }).save();
          })
          .then((tag) => {
            return tag
              .photos()
              .attach(photo)
              .then(() => tag.toJSON());
          });
      });
    })
    .then((tags) => {
      dispatch({ type: 'CREATE_TAGS_SUCCESS', tags });
    });
  };
};

export const initDevices = (e, devices) => {
  return (dispatch) => {
    dispatch({ type: 'INIT_DEVICES_SUCCESS', devices });
  };
};

export const addDevice = (e, device) => {
  return (dispatch) => {
    dispatch({ type: 'ADD_DEVICE_SUCCESS', device });
  };
};

export const removeDevice = (e, device) => {
  console.log('action rm device', device);
  return (dispatch) => {
    dispatch({ type: 'REMOVE_DEVICE_SUCCESS', device });
  };
};

export const setCurrent = (current) => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_SUCCESS', current });
  };
};

export const setCurrentLeft = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_LEFT_SUCCESS' });
  };
};

export const setCurrentRight = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_RIGHT_SUCCESS' });
  };
};

export const toggleDiff = () => {
  console.log('toggle diff');
  return (dispatch) => {
    dispatch({ type: 'TOGGLE_DIFF_SUCCESS' });
  };
};

export const areSettingsExisting = () => {
  return (dispatch) => {
    fs.access(config.settings, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err)
        dispatch({ type: 'SETTINGS_EXISTS_ERROR' });
      else
        dispatch({ type: 'SETTINGS_EXISTS_SUCCESS' });
    });
  };
};
