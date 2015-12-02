import alt from './../alt';
import Promise from 'bluebird';

import Tag from './../models/tag';

class TagActions {

  constructor() {
    this.generateActions(
      'createTagSuccess',
      'createTagsSuccess',
      'getTagsSuccess'
    );
  }

  createTag(tagName) {
    console.log('before action', tagName);
    new Tag({ title: tagName })
      .save()
      .then((tag) => {
        console.log('tag');
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
      console.log('tags', tags);
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
