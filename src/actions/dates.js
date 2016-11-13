import Photo from './../models/photo';

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

