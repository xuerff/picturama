#!/bin/bash
PATH=$PWD/node_modules/.bin:$PATH
ANSEL_PATH=$PWD
PREPARED_PATH=$ANSEL_PATH/build/prepared

# Destroy previous work directories
rm -rf $ANSEL_PATH/build $ANSEL_PATH/dist

npm install

mkdir $ANSEL_PATH/build
mkdir $PREPARED_PATH

babel $ANSEL_PATH/src --out-dir $ANSEL_PATH/dist
lessc $ANSEL_PATH/src/less/index.less $ANSEL_PATH/dist/index.css

cp -r $ANSEL_PATH/dist $PREPARED_PATH
cp -r $ANSEL_PATH/package.json $PREPARED_PATH
cp -r $ANSEL_PATH/keymaps $PREPARED_PATH
cp -r $ANSEL_PATH/menus $PREPARED_PATH
cp -r $ANSEL_PATH/migrations $PREPARED_PATH
cp -r $ANSEL_PATH/static $PREPARED_PATH
cp -r $ANSEL_PATH/node_modules $PREPARED_PATH

cd $PREPARED_PATH
npm prune --production --ignore-scripts
npm dedupe

cp -r $ANSEL_PATH/node_modules/libraw $PREPARED_PATH/node_modules
cp -r $ANSEL_PATH/node_modules/sharp $PREPARED_PATH/node_modules
cp -r $ANSEL_PATH/node_modules/udev $PREPARED_PATH/node_modules
cp -r $ANSEL_PATH/node_modules/exiv2 $PREPARED_PATH/node_modules
cp -r $ANSEL_PATH/node_modules/sqlite3 $PREPARED_PATH/node_modules

# Trimming fat
# rm -r $PREPARED_PATH/node_modules/sharp/docs
# rm -r $PREPARED_PATH/node_modules/sharp/src
# rm -r $PREPARED_PATH/node_modules/exiv2/examples
# rm -r $PREPARED_PATH/node_modules/exiv2/test
# rm -r $PREPARED_PATH/node_modules/sqlite3/src
# rm -r $PREPARED_PATH/node_modules/react/dist
# rm -r $PREPARED_PATH/node_modules/bookshelf/test
# rm -r $PREPARED_PATH/node_modules/bookshelf/tutorials
#
# find $PREPARED_PATH/node_modules/ -type f -name '*.md' -delete
# find $PREPARED_PATH/node_modules/ -type f -name '*.txt' -delete
# find $PREPARED_PATH/node_modules/ -type f -name '*.log' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'license' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'LICENSE' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'CHANGES' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'CHANGELOG' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'PATENTS' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'CNAME' -delete
# find $PREPARED_PATH/node_modules/ -type f -name 'appveyor.yml' -delete
# find $PREPARED_PATH/node_modules/ -type f -name '.travis.yml' -delete
# find $PREPARED_PATH/node_modules/ -type f -name '.jshintrc' -delete
# find $PREPARED_PATH/node_modules/ -type f -name '.npmignore' -delete

cd $ANSEL_PATH/build
electron-packager $PREPARED_PATH Ansel --platform=darwin --arch=x64 --no-prune --out=$ANSEL_PATH/build
# tar cvzf ansel-darwin-x64.tar.gz ansel-darwin-x64
#
# rm -rf $PREPARED_PATH
