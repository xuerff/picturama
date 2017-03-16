ANSEL_PATH=$PWD
APPDIR=$ANSEL_PATH/build/ansel_0.4-1
BUILD_PATH=$ANSEL_PATH/build
APPIMAGETOOL=$ANSEL_PATH/build/appimagetool

rm $APPDIR.deb
rm -rf $APPDIR
mkdir $APPDIR
mkdir $APPDIR/opt/
mkdir $APPDIR/opt/ansel
mkdir $APPDIR/DEBIAN
mkdir $APPDIR/usr/
mkdir $APPDIR/usr/share/
mkdir $APPDIR/usr/share/applications

cp $ANSEL_PATH/scripts/ansel.desktop $APPDIR/usr/share/applications
cp $ANSEL_PATH/scripts/control $APPDIR/DEBIAN
cp -r $BUILD_PATH/ansel-linux-x64/* $APPDIR/opt/ansel

dpkg-deb --build $APPDIR
