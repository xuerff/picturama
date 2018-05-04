import * as fs from 'fs'

import config from './../config';
import Photo from '../models/Photo'

export * from './devices';
export * from './current';
export * from './tags';
export * from './dates';
export * from './import';
export * from './photos';
export * from './flags';
export * from './grid';

export const getProcessed = () => dispatch => {
  Photo.forge()
    .query(q => {
      q.where({ trashed: 0 });
      q.join('versions', 'versions.photo_id', '=', 'photos.id');
    })
    .fetchAll({ withRelated: [ 'versions', 'tags' ] })
    .then(photos => {
      dispatch({ type: 'GET_PHOTOS_SUCCESS', photos: photos.toJSON() });
    });
};

export const toggleDiff = () => dispatch => {
  dispatch({ type: 'TOGGLE_DIFF_SUCCESS' });
};

export const areSettingsExisting = () => dispatch => {
  fs.access(config.settings, fs.constants.R_OK | fs.constants.W_OK, err => {
    if (err)
      dispatch({ type: 'SETTINGS_EXISTS_ERROR' });
    else
      dispatch({ type: 'SETTINGS_EXISTS_SUCCESS' });
  });
};
