import React from 'react';

import TagStore from './../stores/tag-store';

import TagActions from './../actions/tag-actions';
//import PhotoActions from './../actions/photo-actions';

import TagButton from './tag-button';

class Tags extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { tags: [] };
  }

  componentDidMount() {
    TagActions.getTags();
    TagStore.listen(this.appendTags.bind(this));
  }

  //handleTag(tag) {
  //  let state = this.state;
  //  state.currentTag = tag;

  //  PhotoActions.setTagFilter(tag);
  //  this.setState(state);
  //}

  appendTags(data) {
    let state = this.state;
    state.tags = data.tags;
    this.setState(state);
  }

  render() {
    var tagsList = this.state.tags.map((tag) => {
      return (
        <TagButton 
          setTag={() => this.props.actions.setTagFilter(tag)}
          key={tag}
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
