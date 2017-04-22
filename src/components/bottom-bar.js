import React from 'react';

export default class BottomBar extends React.Component {
  render() {
    return (
      <div className="bottom-bar">
        <div className="content">
          <span className="selection">1 selected | <button>Deselect all</button></span>
          <span className="total">120 items</span>
        </div>
      </div>
    );
  }
}
