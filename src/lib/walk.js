import fs from 'fs';
import Path from 'path';
import Promise from 'bluebird';

const fsReadDir = Promise.promisify(fs.readdir);
const fsStat = Promise.promisify(fs.stat);

let walk = (dirName) => {
  return fsReadDir(dirName).map(fileName => { // for each file we take it
    var path = Path.join(dirName, fileName); // get the correct path

    return fsStat(path)
      .then(stat => stat.isDirectory() ? walk(path) : path);
  })
  .reduce((a, b) => a.concat(b), []);
};

export default walk;
