const version = require('./../package.json').version;

let control = `Package: ansel
Version: ${version}
Section: base
Priority: optional
Architecture: amd64
Maintainer: Loic Nogues <nogues.loic@gmail.com>
Description: Ansel
 Digital image organizer powered by the web`;

console.log(control);
