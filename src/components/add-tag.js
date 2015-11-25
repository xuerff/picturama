import React from 'react';

class AddTag extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('modal');
  }

  render() {
    return (
      <div>
        <p>I am the modal</p>
      </div>
    )
  }

}

export default AddTag;
