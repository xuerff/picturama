import Photo from './../models/photo';
import Tag from './../models/tag';

export const setTagFilter = (tag) => {
  return (dispatch) => {
    new Tag({ id: tag.id })
      .fetch({ withRelated: ['photos'] })
      .then((tag) => {
        let photos = tag.related('photos');

        dispatch({ 
          type: 'GET_PHOTOS_SUCCESS', 
          photos: photos.toJSON(),
          tagId: tag.id
        });
      });
  };
};

export const getTags = () => {
  return (dispatch) => {
    new Tag()
      .query((q) => q.orderBy('slug', 'ASC'))
      .fetchAll()
      .then((tags) => {
        dispatch({ type: 'GET_TAGS_SUCCESS', tags: tags.toJSON() });
      });
  };
};

export const createTagsAndAssociateToPhoto = (tags, photoId) => {
  return (dispatch) => {
    new Photo({ id: photoId }).fetch().then((photo) => {
      // TODO: Remove all the previous tag before adding the new one
      return Promise.map(tags, (tagName) => {
        return new Tag({ title: tagName })
          .fetch()
          .then((tag) => {
            console.log('fetched tag', tag);
            if (tag)
              return tag;
            else
              return new Tag({ title: tagName }).save();
          })
          .then((tag) => {
            return tag
              .photos()
              .attach(photo)
              .then(() => tag.toJSON());
          });
      });
    })
    .then((tags) => {
      dispatch({ type: 'CREATE_TAGS_SUCCESS', tags });
    });
  };
};

