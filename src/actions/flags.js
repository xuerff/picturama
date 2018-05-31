import * as Promise from 'bluebird'

import Photo from '../models/Photo'
import { fetchPhotoWork, storePhotoWorkUpdate } from '../BackgroundClient'

export const toggleShowOnlyFlagged = (date, showOnlyFlagged) => {
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
