import KeymapManager from 'atom-keymap';

let keymaps;

const eventListener = (event) => {
  keymaps.handleKeyboardEvent(event);
};

const bind = (el) => {
  keymaps = new KeymapManager();
  keymaps.defaultTarget = el;
  keymaps.loadKeymap(`${__dirname}/../keymaps/linux.json`);

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
