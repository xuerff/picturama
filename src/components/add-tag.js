import React from 'react';

class AddTag extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('modal');
  }

  render() {
    var btnClass = `mdl-button mdl-button--raised mdl-button--colored`;

    return (
      <div className="outer-modal">
        <div className="modal mdl-shadow--2dp">
          <form action="#">
            <h3>Add a tag</h3>

            <div class="mdl-textfield mdl-js-textfield">
              <input class="mdl-textfield__input" type="text" id="tag" />
              <label class="mdl-textfield__label" for="tag">Tag...</label>
            </div>

            <button className={btnClass}>Add</button>
          </form>
        </div>
      </div>
    );
  }

}

export default AddTag;
