import { spawn } from 'child_process';

import config from '../common/config'


export default class AvailableEditors {
  constructor() {
    this.editors = [];

    config.editors.forEach(editor => {
      if (editor.platforms.indexOf(process.platform) !== -1) {
        spawn('which', [ editor.cmd ]).stdout.on('data', () => {
          this.editors.push(editor);
        });
      }
    });
  }
}
