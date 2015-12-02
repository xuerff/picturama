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
    this.tags = this.tags.concat(data);
  }

  onGetTagsSuccess(data) {
    this.tags = data.toJSON();
  }

}

export default alt.createStore(TagStore);
