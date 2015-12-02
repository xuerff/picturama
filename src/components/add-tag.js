import React from 'react';
import TagsInput from 'react-tagsinput'

import TagActions from './../actions/tag-actions';

class AddTag extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tag: null, tags: [] };

    this.handleAutoComplete = this.handleAutoComplete.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    console.log('modal');
  }

  handleAutoComplete(e) {
    console.log('handle auto complete', e);
    let state = this.state;
    state.tag = e.target.value;
    this.setState(state);
  }

  handleChange(tags) {
    let state = this.state;
    state.tags = tags;
    this.setState(state);
  }

  handleSubmit(e) {
    console.log('handle submit');
    e.preventDefault();
    var tag = this.state.tag.trim();
    TagActions.createTag(tag);
  }

  render() {
    var btnClass = `button button--raised button--colored`;

    return (
      <div className="outer-modal">
        <div className="modal shadow--2dp">
          <form onSubmit={this.handleSubmit}>
            <h3>Add a tag</h3>

            <div className="textfield">
              <input 
                className="textfield" 
                type="text" 
                onChange={this.handleAutoComplete}
                value={this.state.tag}
                placeholder="tag"
                id="tag" />

              <TagsInput
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

export default AddTag;
