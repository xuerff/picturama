Geometry concept
================

This document describes how geometry operations are applied to photos.

Geometry operations are:

  - EXIF rotation: rotation in 90° steps around the z axis defined in EXIF meta data
  - User rotation: rotation in 90° steps around the z axis applied by the user
  - Tilt: free rotation around the z axis
  - In future versions:
    - Perspective: rotation around the x or y axis
    - Mirroring: 180° rotation around the x or y axis


Coordinate systems
------------------

Texture coordinates:

  - Describes the texture (= original pixel data) of a photo - before any geometry operation was applied.
  - Origin: The left-top corner of the texture
  - Unit: texture pixels

Projected coordinates:

  - The photo pixels after all geometry operations have been applied
  - Origin: The center of the photo
    - Why the center? All geometry operations are applied around the center. So the center is the only point which
      always corresponds to the same texture pixel (the texture's center).
    - The center is rounded, so projected coordinates correspond to whole texture pixels even if width or height is odd.
  - Unit: texture pixels

Canvas coordinates:

  - The pixels as they are shown on the canvas
  - Origin: The left-top corner of the canvas
  - Unit: canvas pixels

Display coordinates:

  - The pixels as they are used to display the canvas
  - Origin: The left-top corner of the canvas
  - Unit: display pixels (depends on what "display" means, the detail view uses CSS px)


Matrices
--------

Projection matrix:

  - Translates from texture coordinates to projected coordinates

Camera matrix:

  - Translates from projected coordinates to canvas coordinates

Display matrix:

  - Translates from projected coordinates to display coordinates
