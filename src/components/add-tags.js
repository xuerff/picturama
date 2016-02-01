import React from 'react';
import TagsInput from 'react-tagsinput';

import TagActions from './../actions/tag-actions';
import TagStore from './../stores/tag-store';

class AddTags extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tags: [] };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.keyboardListener = this.keyboardListener.bind(this);
  }

  keyboardListener(e) {
    console.log('add tag keyboard listener', e);

    e.preventDefault();

    if (e.keyCode == 27) // escape
      this.props.closeTagDialog();
  }

  componentDidMount() {
    let state = this.state;

    TagStore.listen(this.props.closeTagDialog);
    document.addEventListener('keyup', this.keyboardListener);

    if (this.props.photo.tags.length > 0)
      this.state.tags = this.props.photo.tags.map((tag) => tag.title);

    this.setState(state);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener);
  }

  handleChange(tags) {
    let state = this.state;
    state.tags = tags;
    this.setState(state);
  }

  handleSubmit(e) {
    e.preventDefault();
    let tags = this.state.tags.map((tag) => tag.trim());
    TagActions.createTagsAndAssociateToPhoto(tags, this.props.photo.id);
  }

  render() {
    var btnClass = `button button--raised button--colored`;

    return (
      <div className="outer-modal">
        <div className="modal shadow--2dp">
          <form onSubmit={this.handleSubmit}>
            <h3>Add a tag</h3>

            <div className="textfield">
              <TagsInput
                id="tags"
                value={this.state.tags}
                onChange={this.handleChange} />
            </div>

            <button className={btnClass}>Add</button>
          </form>
        </div>
      </div>
    );
  }

}

export default AddTags;
