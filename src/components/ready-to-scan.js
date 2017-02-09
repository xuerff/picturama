import { ipcRenderer } from 'electron';
import React from 'react';

export default class ReadyToScan extends React.Component {
  startScanning() {
    ipcRenderer.send('start-scanning');
  }

  render() {
    return (
      <div>
        <p>
          <span>No photos imported. press Ctrl+R or </span>
          <button 
            id="start-scanning"
            onClick={this.startScanning.bind(this)}>click here</button>
          <span> to start scanning</span>
        </p>
      </div>
    );
  }
}
