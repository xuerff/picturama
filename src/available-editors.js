import { spawn } from 'child_process';

const editors = [
  { name: 'Gimp', cmd: 'gimp', format: 'JPG'},
  { name: 'Rawtherapee', cmd: 'rawtherapee', format: 'RAW'},
  { name: 'Darktable', cmd: 'darktable', format: 'RAW'}
];

export default class AvailableEditors {
  constructor() {
    this.editors = [];

    editors.forEach(editor => {
      spawn('which', [editor.cmd]).stdout.on('data', () => {
        this.editors.push(editor);
      });
    });
  }
}
