import React from 'react';

import TagStore from './../stores/tag-store';

import TagActions from './../actions/tag-actions';
import PhotoActions from './../actions/photo-actions';

import TagButton from './tag-button';

class Tags extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tags: [], currentTag: null };
  }

  componentDidMount() {
    TagActions.getTags();
    TagStore.listen(this.appendTags.bind(this));
  }

  handleTag(tag) {
    let state = this.state;
    state.currentTag = tag;

    PhotoActions.setTagFilter(tag);
    this.setState(state);
  }

  appendTags(data) {
    let state = this.state;
    state.tags = data.tags;
    this.setState(state);
  }

  render() {
    var tagsList = this.state.tags.map((tag) => {
      return (
        <TagButton 
          setTag={this.handleTag.bind(this)} 
          tag={tag} />
      );
    });

    return (
      <div className="tags">
        <h3><i className="fa fa-tags"></i> Tags</h3>
        <ul>{tagsList}</ul>
      </div>
    );

  }
}

export default Tags;
