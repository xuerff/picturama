import { combineReducers } from 'redux';

import photos from './photos';
import dates from './dates';
import tags from './tags';
import settings from './settings';
import importation from './importation';
import current from './current';
import devices from './devices';
import diff from './diff';

export default combineReducers({
  photos,
  dates,
  tags,
  settings,
  importation,
  current,
  devices,
  diff
});
