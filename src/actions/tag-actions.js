import alt from './../alt';

import Tag from './../models/tag';

class TagActions {

  constructor() {
    this.generateActions(
      'createTagSuccess',
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

  getTags() {
    new Tag().fetchAll().then((tags) => {
      this.actions.getTagsSuccess(tags);
    });
  }

}

export default alt.createActions(TagActions);
