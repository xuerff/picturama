import { ipcRenderer } from 'electron';

const selectors = {
  core: {
    'core:quit': () => ipcRenderer.send('command', 'core:quit'),
    'core:scan': () => ipcRenderer.send('command', 'core:scan'),
    'core:scan-for-tags': () => ipcRenderer.send('command', 'core:scan-for-tags')
  }
};

export default class RenderedCommands {
  constructor(selector) {
    this.selector = selector || 'core';

    this.quit = this.quit.bind(this);
    this.scan = this.scan.bind(this);
  }

  mount(bindings) {
    ipcRenderer.on('dispatch-command', this.dispatchCommand.bind(this));

    Object.keys(selectors[this.selector]).forEach(command => {
      window.addEventListener(command, selectors[this.selector][command]);
    });

    if (bindings.hasOwnProperty('toggleSidebar'))
      window.addEventListener('core:toggleSidebar', bindings.toggleSidebar);
  }

  unmount(bindings) {
    ipcRenderer.removeAllListeners('dispatch-command');

    Object.keys(selectors[this.selector]).forEach(command => {
      window.removeEventListener(command, selectors[this.selector][command]);
    });

    if (bindings.hasOwnProperty('toggleSidebar'))
      window.removeEventListener('core:toggleSidebar', bindings.toggleSidebar);
  }

  dispatchCommand(e, command) {
    const event = document.createEvent('HTMLEvents');

    event.initEvent(command, true, true);
    window.dispatchEvent(event);
  }

  quit() {
    ipcRenderer.send('core:quit');
  }

  scan() {
    ipcRenderer.send('core:scan');
  }
}
