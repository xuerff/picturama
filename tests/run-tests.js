import Mocha from 'mocha';
var mocha = new Mocha();

Mocha.utils.lookupFiles('tests-dist/', ['js'], true)
  .forEach(mocha.addFile.bind(mocha));

mocha.run(process.exit);
