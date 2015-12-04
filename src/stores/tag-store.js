import alt from './../alt';

import TagActions from './../actions/tag-actions';

class TagStore {

  constructor() {
    this.bindActions(TagActions);
    this.tags = [];
  }

  onCreateTagSuccess(data) {
    this.tags.push(data.toJSON());
  }

  onCreateTagsSuccess(data) {
    let tags = data.map((tag) => {
      let exists = false;

      this.tags.forEach((storeTag) => {
        if (tag.slug == storeTag.slug)
          exists = true;
      });

      return (!exists) ? tag : null;
    })
    .filter((tag) => tag);

    if (tags.length > 0)
      this.tags = this.tags.concat(tags);
  }

  onGetTagsSuccess(data) {
    this.tags = data.toJSON();
  }

}

export default alt.createStore(TagStore);
