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

  console.log(`${config.menusFolder}/linux.json`);
  keymaps.onDidMatchBinding((e) => console.log('match', e));
  //keymaps.onDidPartiallyMatchBindings((e) => console.log('partially', e));
  //keymaps.onDidFailToMatchBinding((e) => console.log('fail', e));
  //keymaps.onDidFailToReadFile((e) => console.log('fail read', e));

  document.addEventListener('keydown', eventListener);
};

const unbind = () => {
  document.removeEventListener('keydown', eventListener);
};

export default { bind, unbind };
