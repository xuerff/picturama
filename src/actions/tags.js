import Photo from './../models/photo';
import Tag from './../models/tag';

export const setTagFilter = tag => dispatch => {
  new Tag({ id: tag.id })
    .fetch({ withRelated: [ 'photos' ] })
    .then(tag => {
      let photos = tag.related('photos');

      dispatch({
        type: 'GET_PHOTOS_SUCCESS',
        photos: photos.toJSON(),
        tagId: tag.id
      });
    });
};

export const getTags = () => dispatch => {
  new Tag()
    .query(q => q.orderBy('slug', 'ASC'))
    .fetchAll()
    .then(tags => {
      dispatch({ type: 'GET_TAGS_SUCCESS', tags: tags.toJSON() });
    });
};

export const createTagsAndAssociateToPhoto = (tags, photoId) => dispatch => {
  new Photo({ id: photoId }).fetch()
    // TODO: Remove all the previous tag before adding the new one
    .then(photo => Promise.map((tags, tagName) => new Tag({ title: tagName })
      .fetch()
      .then(tag => {
        if (tag)
          return tag;

        return new Tag({ title: tagName }).save();
      })
      .then(tag => tag
          .photos()
          .attach(photo)
          .then(() => tag.toJSON())
      )
    ))
    .then(tags => {
      dispatch({ type: 'CREATE_TAGS_SUCCESS', tags });
    });
};
