import { ipcRenderer } from 'electron';

const selectors = {
  core: {
    'core:quit': () => ipcRenderer.send('command', 'core:quit'),
    'core:scan': () => ipcRenderer.send('command', 'core:scan'),
    'core:scan-for-tags': () => ipcRenderer.send('command', 'core:scan-for-tags'),
    'core:toggleSidebar': 'toggleSidebar'
  },
  grid: {
    'grid:selectAll': 'highlightAll',
    'grid:left': 'moveHighlightLeft',
    'grid:right': 'moveHighlightRight',
    'grid:up': 'moveHighlightUp',
    'grid:down': 'moveHighlightDown',
    'grid:enter': 'pressedEnter'
  },
  detail: {
    'detail:cancel': 'cancelEvent',
    'detail:diff': 'toggleDiff',
    'detail:flag': 'toggleFlag',
    'detail:moveToTrash': 'moveToTrash',
    'detail:moveLeft': 'setCurrentLeft',
    'detail:moveRight': 'setCurrentRight'
  }
};

export default class RenderedCommands {
  constructor(selector) {
    this.selector = selector || 'core';

    this.getSelectorFunction = this.getSelectorFunction.bind(this);
  }

  getSelectorFunction(command, bindings) {
    let value = selectors[this.selector][command];

    if (typeof value === 'string' && bindings.hasOwnProperty(value))
      value = bindings[value];

    return value;
  }

  mount(bindings) {
    ipcRenderer.on('dispatch-command', this.dispatchCommand.bind(this));

    if (selectors.hasOwnProperty(this.selector)) {
      Object.keys(selectors[this.selector]).forEach(command => {
        window.addEventListener(command, this.getSelectorFunction(command, bindings));
      });
    }
  }

  unmount(bindings) {
    ipcRenderer.removeAllListeners('dispatch-command');

    if (selectors.hasOwnProperty(this.selector)) {
      Object.keys(selectors[this.selector]).forEach(command => {
        window.removeEventListener(command, this.getSelectorFunction(command, bindings));
      });
    }
  }

  dispatchCommand(e, command) {
    const event = document.createEvent('HTMLEvents');

    event.initEvent(command, true, true);
    window.dispatchEvent(event);
  }
}
