import Photo from './../models/photo';

export const getPhotos = () => {
  return (dispatch) => {
    Photo
      .query(function (qb) {
        qb.limit(100).offset(0).orderBy('created_at', 'desc');
      })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then((photos) => {
        dispatch({ type: 'GET_PHOTOS', photos: photos.toJSON() });
      });
  };
};
