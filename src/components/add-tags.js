import React from 'react';
import TagsInput from 'react-tagsinput';

//import TagStore from './../stores/tag-store';

export default class AddTags extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    closeTagDialog: React.PropTypes.func.isRequired,
    photo: React.PropTypes.object.isRequired,
    tags: React.PropTypes.array.isRequired,
    id: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    let tags = [];

    if (this.props.photo.tags.length > 0)
      tags = this.props.photo.tags.map((tag) => tag.title);

    this.state = { tags: tags };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.keyboardListener = this.keyboardListener.bind(this);
  }

  keyboardListener(e) {
    e.preventDefault();

    if (e.keyCode == 27) // escape
      this.props.closeTagDialog();
  }

  componentDidMount() {
    this.refs.tags.focus();

    document.addEventListener('keyup', this.keyboardListener);
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

    this.props.actions.createTagsAndAssociateToPhoto(tags, this.props.photo.id);
    this.props.closeTagDialog();
  }

  render() {
    var btnClass = 'button button--raised button--colored';

    return (
      <div className="outer-modal">
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
