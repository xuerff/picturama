import photos from './photos';
import importation from './importation';
import others from './others';

const initialState = {
  splashed: false,
  importing: false,
  currentDate: null,
  currentTag: null,
  showOnlyFlagged: false,
  current: -1,
  diff: false,
  settingsExists: false,
  photos: [],
  tags: [],
  devices: [],
  dates: { years: [] },
  progress: { processed: 0, total: 0 }
};

const runReducers = (state, action, reducers) => {
  let reducersList = Object.keys(reducers);

  reducersList.forEach((key) => {
    state = reducers[key](state, action);
  });

  return state;
};

export default function reducers(state = initialState, action) {
  return runReducers(state, action, {
    photos,
    importation,
    others
  });
}
