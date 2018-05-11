import current from './current';
import dates from './dates';
import devices from './devices';
import diff from './diff';
import importation from './importation';
import photos from './photos';
import settings from './settings';
import tags from './tags';
import grid from './grid';
import currentPhotoWork from './currentPhotoWork'

const initialState = {
  splashed: false,
  importing: false,
  currentDate: null,
  currentTag: null,
  showOnlyFlagged: false,
  current: -1,
  currentPhotoWork: null,
  diff: false,
  settingsExists: false,
  route: '',
  photosCount: 0,
  photos: [],
  tags: [],
  devices: [],
  dates: { years: [] },
  progress: { processed: 0, total: 0 },
  highlighted: []
};

const runReducers = (state, action, reducers) => {
  let reducersList = Object.keys(reducers);

  reducersList.forEach(key => {
    state = reducers[key](state, action);
  });

  return state;
};

export default function reducers(state = initialState, action) {
  return runReducers(state, action, {
    current,
    dates,
    devices,
    diff,
    importation,
    photos,
    settings,
    tags,
    grid,
    currentPhotoWork
  });
}
