import { ipcRenderer } from 'electron';

export default class RenderedCommands {
  constructor() {
    this.quit = this.quit.bind(this);
    this.scan = this.scan.bind(this);
  }

  mount(bindings) {
    ipcRenderer.on('dispatch-command', this.dispatchCommand.bind(this));

    window.addEventListener('core:quit', this.quit);
    window.addEventListener('core:scan', this.scan);

    if (bindings.hasOwnProperty('toggleSidebar'))
      window.addEventListener('core:toggleSidebar', bindings.toggleSidebar);
  }

  unmount(bindings) {
    ipcRenderer.removeAllListeners('dispatch-command');

    window.removeEventListener('core:quit', this.quit);
    window.removeEventListener('core:scan', this.scan);

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
