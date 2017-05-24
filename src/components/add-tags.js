import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';

const btnClass = 'button button--raised button--colored';

export default class AddTags extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    closeTagDialog: PropTypes.func.isRequired,
    photo: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    let tags = [];

    if (this.props.photo.tags.length > 0)
      tags = this.props.photo.tags.map(tag => tag.title);

    this.state = { tags: tags };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.refs.tags.focus();

    window.addEventListener('core:cancel', this.props.closeTagDialog);
  }

  componentWillUnmount() {
    window.removeEventListener('core:cancel', this.props.closeTagDialog);
  }

  handleChange(tags) {
    let state = this.state;

    state.tags = tags;
    this.setState(state);
  }

  handleSubmit(e) {
    e.preventDefault();
    let tags = this.state.tags.map(tag => tag.trim());

    this.props.actions.createTagsAndAssociateToPhoto(tags, this.props.photo.id);
    this.props.closeTagDialog();
  }

  render() {
    return (
      <div className="outer-modal" id="add-tags">
        <div className="modal shadow--2dp">
          <form onSubmit={this.handleSubmit}>
            <h3>Add a tag</h3>

            <div className="textfield">
              <TagsInput
                id="tags"
                ref="tags"
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
