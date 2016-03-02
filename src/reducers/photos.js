const initialState = [{}];

export default function photos(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return action.photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
        photo.versionNumber = 1 + photo.versions.length;

        let lastVersion = photo.versions[photo.versions.length - 1];

        photo.thumb = lastVersion.output;
        photo.thumb_250 = lastVersion.thumbnail;
      }

      return photo;
    });
 
  default:
    return state;
  }
}
