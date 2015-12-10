import alt from './../alt';
import Promise from 'bluebird';

import Tag from './../models/tag';
import Photo from './../models/photo';

class TagActions {

  constructor() {
    this.generateActions(
      'createTagSuccess',
      'createTagsSuccess',
      'getTagsSuccess'
    );
  }

  createTag(tagName) {
    new Tag({ title: tagName })
      .save()
      .then((tag) => {
        this.actions.createTagSuccess(tag);
      });
  }

  createTags(tags) {
    Promise.map(tags, (tagName) => {
      return new Tag({ title: tagName })
        .save()
        .then((tag) => tag.toJSON());
    })
    .then((tags) => {
      this.actions.createTagsSuccess(tags);
    });
  }

  createTagsAndAssociateToPhoto(tags, photoId) {
    new Photo({ id: photoId }).fetch().then((photo) => {
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
      this.actions.createTagsSuccess(tags);
    });
  }

  getTags() {
    new Tag().fetchAll().then((tags) => {
      this.actions.getTagsSuccess(tags);
    });
  }

}

export default alt.createActions(TagActions);
