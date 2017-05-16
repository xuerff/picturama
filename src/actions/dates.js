import Photo from './../models/photo';

export const setDateFilter = (date, showOnlyFlagged) => dispatch => {
  new Photo()
    .where({ date: date, trashed: false, flag: showOnlyFlagged })
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

