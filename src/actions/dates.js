import Photo from '../models/Photo'

export const setDateFilter = (date, showOnlyFlagged) => dispatch => {
  const where = { date: date, trashed: false }
  if (showOnlyFlagged) {
    where.flag = true
  }
  new Photo()
    .where(where)
    .fetchAll({ withRelated: [ 'versions', 'tags' ] })
    .then(photos => {
      dispatch({
        type: 'GET_PHOTOS_SUCCESS',
        photos: photos.toJSON(),
        date: date
      });
    });
};

export const getDates = () => dispatch => {
  Photo.getDates().then(dates => {
    dispatch({ type: 'GET_DATES_SUCCESS', dates });
  });
};
