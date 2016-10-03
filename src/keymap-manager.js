import KeymapManager from 'atom-keymap';

import config from './config';

let keymaps;

const eventListener = (event) => {
  keymaps.handleKeyboardEvent(event);
};

const bind = (el) => {
  keymaps = new KeymapManager();
  keymaps.defaultTarget = el;
  keymaps.loadKeymap(`${config.keymapsFolder}/linux.json`);

  document.addEventListener('keydown', eventListener);
};

const unbind = () => {
  document.removeEventListener('keydown', eventListener);
};

export default { bind, unbind };
