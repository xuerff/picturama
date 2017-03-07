#!/bin/bash
ANSEL_PATH=$PWD
APPDIR=$ANSEL_PATH/build/Ansel.AppDir
BUILD_PATH=$ANSEL_PATH/build
APPIMAGETOOL=$ANSEL_PATH/build/appimagetool

rm -rf $APPDIR
mkdir $APPDIR

cp $ANSEL_PATH/logo.png $APPDIR/ansel.png
cp $ANSEL_PATH/scripts/ansel.desktop $APPDIR
cp -r $BUILD_PATH/ansel-linux-x64/* $APPDIR

# Get AppImage tool
wget -c https://github.com/probonopd/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage -O $APPIMAGETOOL
chmod +x $APPIMAGETOOL

# Build AppImage
./$APPIMAGETOOL $APPDIR $BUILD_PATH
