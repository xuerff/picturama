Changelog
=========


v1.3.0 - 2020-09-27
-------------------

  - French translation (thanks to @aelisya)
  - Compact title bar also on Windows and Linux (#51)


v1.2.0 - 2020-09-06
-------------------

  - Support for HEIC / HEIF
  - Showing all EXIF data
  - Showing photo location on a mini map
  - Support for HiRes displays (#31, thanks to @cxcxcxcx)
  - 20x faster scanning (#33, thanks to @cxcxcxcx and @MikeKovarik)
  - Other bugfixes and improvements


v1.1.0 - 2019-10-28
-------------------

  - Ansel is now called Picturama
  - Spanish translation (thanks to @ChesuCR)
  - Cropping and tilting of photos
  - Improved export
  - Improved import of Picasa's `Originals` folders
  - Other bugfixes and improvements


v1.0.0 - 2019-08-29
-------------------

  - Nearly complete rewrite of the whole app
  - New Typescript-based build system under the hood
  - Support for windows (except reading raw formats)
  - Improved UI (only export dialog is still the old one)
  - Endless scrolling photo viewer
  - 3D accelerated detail view
  - Import is faster and runs in background (doesn't block the app any more)
  - View EXIF information
  - Fixed tags
  - Import of Picasa meta data (only supported parts)
  - Writes own meta data in ansel.json files in image folders (so a backup of the photos contains them or other users can import them)
  - German translation
  - Many bugfixes


v0.4.1 - 2017-03-17
-------------------

Added new .deb package


v0.4.0 - 2017-02-24
-------------------

  - Atom-keymap listener
  - Picture flag toggle
  - Delete picture(s)
  - Action on several pictures
  - Scan for new tags
  - Grid layout for library view
  - Arrow navigation for library & picture detail view
  - Splash screen
  - Header bar
  - Styling for welcome page


v0.3.0 - 2016-04-07
-------------------

In this new version, the various C++ libraries upon which Ansel is built are now bundled within the app. This will
increase the overall payload but also ensure that Ansel will work on various Linux distributions.

Reading XMP tags in photos is now possible thanks to the exiv2 library.

Please feel free to test the application with the provided binary and don't forget to open a GitHub issue if something
isn't working as expected.


v0.2.1 2016-04-14
-----------------

Fixed bug causing the app not find the SQL migrations directory


v0.2.0 - 2016-04-12
-------------------

Fix bug forcing you to restart the app before importing photos.


v0.1 - 2016-03-11
-----------------

This is the initial release of Ansel. So far only linux x64 is supported.
