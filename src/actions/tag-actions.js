import alt from './../alt';

import Tag from './../models/tag';

class TagActions {

  constructor() {
    this.generateActions(
      'createTagSuccess'
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

}

export default alt.createActions(TagActions);
