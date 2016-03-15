import React from 'react';
import { connect } from 'react-redux';

import TagButton from './tag-button';

class Tags extends React.Component {
  static propTypes = {
    tags: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { tags: [] };
  }

  componentDidMount() {
    this.props.actions.getTags();
  }

  appendTags(data) {
    let state = this.state;
    state.tags = data.tags;
    this.setState(state);
  }

  render() {
    return (
      <div className="tags">
        <h3><i className="fa fa-tags"></i> Tags</h3>
        <ul>
          {this.props.tags.map(tag =>
            <TagButton 
              setTag={() => this.props.actions.setTagFilter(tag)}
              key={tag.slug}
              tag={tag} />
          )}
        </ul>
      </div>
    );

  }
}

const ReduxTags = connect(state => ({
  tags: state.tags
}))(Tags);

export default ReduxTags;
export { Tags };
