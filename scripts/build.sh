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
lessc $ANSEL_PATH/src/source.less $ANSEL_PATH/dist/source.css

cp $ANSEL_PATH/dist $PREPARED_PATH -r
cp $ANSEL_PATH/package.json $PREPARED_PATH
cp $ANSEL_PATH/keymaps $PREPARED_PATH -r
cp $ANSEL_PATH/menus $PREPARED_PATH -r
cp $ANSEL_PATH/migrations $PREPARED_PATH -r
cp $ANSEL_PATH/static $PREPARED_PATH -r
cp $ANSEL_PATH/node_modules $PREPARED_PATH -r

cd $PREPARED_PATH
npm prune --production --ignore-scripts

cp $ANSEL_PATH/node_modules/libraw $PREPARED_PATH/node_modules -r
cp $ANSEL_PATH/node_modules/sharp $PREPARED_PATH/node_modules -r
cp $ANSEL_PATH/node_modules/udev $PREPARED_PATH/node_modules -r
cp $ANSEL_PATH/node_modules/exiv2 $PREPARED_PATH/node_modules -r
cp $ANSEL_PATH/node_modules/sqlite3 $PREPARED_PATH/node_modules -r

cd $ANSEL_PATH/build
electron-packager $PREPARED_PATH ansel --platform=linux --arch=x64 --no-prune --out=$ANSEL_PATH/build

rm -rf $PREPARED_PATH
