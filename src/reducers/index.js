import current from './current';
import dates from './dates';
import devices from './devices';
import diff from './diff';
import importation from './importation';
import photos from './photos';
import settings from './settings';
import tags from './tags';

const initialState = {
  splashed: false,
  importing: false,
  currentDate: null,
  currentTag: null,
  showOnlyFlagged: false,
  current: -1,
  diff: false,
  settingsExists: false,
  route: '',
  photos: [],
  tags: [],
  devices: [],
  dates: { years: [] },
  progress: { processed: 0, total: 0 }
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
    tags
  });
}
