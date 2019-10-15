The format of picasa.ini
========================

Author: Til Schneider (GitHub: @til-schneider)

Links:

  - [.picasa.ini FILE STRUCTURE](https://gist.github.com/fbuchinger/1073823) of Franz Buchinger <fbuchinger@gmail.com>


Tilt
----

Tilt is a free rotation of the z axis around the center of the photo. It is stored as a filter like so:
`tilt=1,0.660013,0.000000;`. The first number is always `1`, the last always `0`. The value in the middle holds the
actual tilt factor and is something between `-1` and `1`. There may be more than one tilt filter.

This formula translates Picasa's tilt factor into degrees:

```js
var degrees = tilt * -11.3848
```


### Background: How I determined the degrees to tilt ratio

I created an image of 1000x800 px with a point in the center and another point 250 px to the right of the center point.
Then I adjusted the tilt value in `.picasa.ini` and exported the image from Picasa. Then I measured the positions of the
points.

The degrees are calculated like this:

```js
var degrees = Math.atan2(pointY - centerY, pointX - centerX) * 180 / Math.PI
```

|  Tilt factor | Image size | Center point | Right point |  degrees | degrees / tilt |
| ------------ | ---------- | ------------ | ----------- | -------- | -------------- |
|            0 | 1000 x 800 |     500, 400 |    750, 400 |        0 |            NaN |
|     0.100000 | 1000 x 800 |     500, 400 |    756, 395 |  -1.1189 |       -11.1890 |
|     0.200000 | 1000 x 800 |     500, 400 |    762, 390 |  -2.1858 |       -10.9290 |
|     0.300000 | 1000 x 800 |     500, 400 |    768, 384 |  -3.4166 |       -11.3887 |
|     0.400000 | 1000 x 800 |     500, 400 |    773, 378 |  -4.6073 |       -11.5183 |
|     0.500000 | 1000 x 800 |     500, 400 |    779, 372 |  -5.7309 |       -11.4618 |
|     0.600000 | 1000 x 800 |     500, 400 |    784, 366 |  -6.8269 |       -11.3782 |
|     0.700000 | 1000 x 800 |     500, 400 |    788, 359 |  -8.1022 |       -11.5746 |
|     0.800000 | 1000 x 800 |     500, 400 |    793, 353 |  -9.1132 |       -11.3915 |
|     0.900000 | 1000 x 800 |     500, 400 |    797, 346 | -10.3048 |       -11.4498 |
|     1.000000 | 1000 x 800 |     500, 400 |    801, 339 | -11.4563 |       -11.4563 |
|    -0.500000 | 1000 x 800 |     500, 400 |    779, 428 |   5.7309 |       -11.4618 |
|    -1.000000 | 1000 x 800 |     500, 400 |    802, 461 |  11.4193 |       -11.4193 |
| 2x -1.000000 | 1000 x 800 |     500, 400 |    848, 546 |  22.7600 |     (not used) |

The data is linear. The average degrees to tilt ratio is `-11.3848`.

The whole thing as a plot:

<svg viewBox="0 0 100 100" style="max-width: 400px">
  <rect x="0" y="0" width="100" height="100" stroke="gray" />
  <g transform="translate(50, 50) scale(45, 4)">
    <line x1="1.0" y1="-11.3848" x2="-1.0" y2="11.3848" stroke="blue" stroke-width="0.01" />
    <circle cx= "0"   cy=  "0"      r="0.03" fill="red" />
    <circle cx= "0.1" cy= "-1.1189" r="0.03" fill="red" />
    <circle cx= "0.2" cy= "-2.1858" r="0.03" fill="red" />
    <circle cx= "0.3" cy= "-3.4166" r="0.03" fill="red" />
    <circle cx= "0.4" cy= "-4.6073" r="0.03" fill="red" />
    <circle cx= "0.5" cy= "-5.7309" r="0.03" fill="red" />
    <circle cx= "0.6" cy= "-6.8269" r="0.03" fill="red" />
    <circle cx= "0.7" cy= "-8.1022" r="0.03" fill="red" />
    <circle cx= "0.8" cy= "-9.1132" r="0.03" fill="red" />
    <circle cx= "0.9" cy="-10.3048" r="0.03" fill="red" />
    <circle cx= "1.0" cy="-11.4563" r="0.03" fill="red" />
    <circle cx="-0.5" cy=  "5.7309" r="0.03" fill="red" />
    <circle cx="-1.0" cy= "11.4193" r="0.03" fill="red" />
  </g>
</svg>


Crop rect
---------

Picasa stores the crop rect in a `rect64` statement and a `rect64` filter which holds a 64 bit hexadecimal number.

Example statement:

    crop=rect64(37cf3e1466a89b33)

Example filter:

    crop64=1,37cf3e1466a89b33;

This number breaks up into 4 16-bit numbers which describe the left, top, bottom and right position of the crop rect.
Relative to the top/left corner in a value between `0` (top/left) and `0xffff` (bottom/right).

So the position can be calculated like so:

```js
// Fill picasaCropRect with leading zeros
while (picasaCropRect.length < 16) {
    picasaCropRect = '0' + picasaCropRect
}

const left   = parseInt(picasaCropRect.substring( 0,  4), 16) / 0xffff * photoWidth
const top    = parseInt(picasaCropRect.substring( 4,  8), 16) / 0xffff * photoHeight
const bottom = parseInt(picasaCropRect.substring( 8, 12), 16) / 0xffff * photoWidth
const right  = parseInt(picasaCropRect.substring(12, 16), 16) / 0xffff * photoHeight
```

This works well until there is no tilt. But with tilt, things are more complicated.


### Background: How does Picasa change the crop rect when only tilt is applied

I created a test image, which holds a raster allowing to determine the original position of a pixel after
the image was rotated or cropped - see `doc/picasa-ini-format/raster.png`.

Then I determined the rect of just the tilt operation with different tilt values by exporting the raster.png from Picasa:

| Tilt factor | Image size | Original pixels                      |
| ----------- | ---------- | ------------------------------------ |
|        0.25 |  800 x 600 | (40,0) (790,38) (761,600) (12,563)   |
|        0.50 |  800 x 600 | (75,0) (780,72) (726,600) (22,529)   |
|        0.75 |  800 x 600 | (105,0) (771,100) (695,600) (30,500) |
|        1.00 |  800 x 600 | (133,0) (764,128) (668,600) (38,473) |

Original pixels as a plot:

<svg viewBox="0 0 800 600" style="max-width: 400px">
  <rect x="0" y="0" width="800" height="600" stroke="gray" />
  <path d="M40,0 L790,38 L761,600 L12,563 Z" stroke="#ff0000" stroke-width="1" fill="none" />
  <path d="M75,0 L780,72 L726,600 L22,529 Z" stroke="#cc0000" stroke-width="1" fill="none" />
  <path d="M105,0 L771,100 L695,600 L30,500 Z" stroke="#aa0000" stroke-width="1" fill="none" />
  <path d="M133,0 L764,128 L668,600 L38,473 Z" stroke="#880000" stroke-width="1" fill="none" />
</svg>

**Conclusion:** When only tilt is applied, Picasa shrinks the rect so it fits into the original photo while keeping
the aspect ratio. This is the same as `GeometryUtil.scaleCropRectToTexture` does.


### Background: How to calculate the crop rect together with tilt

For this test I used a crop rect with a tilt that goes through whole pixel values. Picasa has a maximum tilt of 11.3848
degrees. A tilt of 5 px right, 1 px up would be 11.3 degrees - which is in range, but very close to it. So I took
6 px right, 1 px up which is `9.46` degrees or a Picasa tilt value of `-0.8311` (`Math.atan2(1,6) * 180 / Math.PI / -11.3848`).
In order to get the rect untilted, we have to tilt in the opposite direction, which is a Picasa tilt value of `0.8311`.

I extended the raster.png by a random crop rect (green) and determined the according tilted canvas which fits into the
original photo (like above).

  - Crop rect in original pixels: `(100,200) (520,270) (490,450) (70,380)` (See `doc/picasa-ini-format/generate-raster-svg.js`)
  - Tilted canvas in original pixels: `(115,0) (768,110) (686,600) (33,490)`

The whole thing as a plot:

<svg viewBox="0 0 800 600" style="max-width: 400px">
  <rect x="0" y="0" width="800" height="600" stroke="gray" />
  <path d="M100,200 L520,270 L490,450 L70,380 Z" stroke="green" stroke-width="1" fill="none"/>
  <path d="M115,0 L768,110 L686,600 L33,490 Z" stroke="green" stroke-width="1" fill="none"/>
</svg>

Now I cropped the image to the rect in Picasa. And Picasa created the following rect64: `a454e8bbd6bfff`.
In relative values this is: [0.0025024795910582134, 0.3316700999465934, 0.7337453269245441, 0.7499961852445258]

**Assumption 1: The rect64 describes the position in the tilted canvas**

  - The size of the tilted canvas is 662.2 x 496.8 which is 800 x 600 scaled by 0.828
  - The crop rect scaled to 800 x 600 is: [2, 199, 587, 450]

The rotated and scaled canvas and crop rect as a plot:

<svg viewBox="0 0 800 600" style="max-width: 400px">
  <rect x="0" y="0" width="800" height="600" stroke="gray" />
  <path d="M100,200 L520,270 L490,450 L70,380 Z" stroke="green" stroke-width="1" fill="none"/>
  <path d="M115,0 L768,110 L686,600 L33,490 Z" stroke="green" stroke-width="1" fill="none"/>
  <g transform="translate(400, 300) rotate(9.46) scale(0.828) translate(-400, -300)">
    <rect x="0" y="0" width="800" height="600" stroke="red" fill="none" />
    <rect x="2" y="199" width="585" height="251" stroke="red" fill="none" />
  </g>
</svg>

So this doesn't match.

**Assumption 2: The rect64 has something to do with the original canvas**

The crop rect in the original canvas as a plot:

<svg viewBox="0 0 800 600" style="max-width: 400px">
  <rect x="0" y="0" width="800" height="600" stroke="gray" />
  <path d="M100,200 L520,270 L490,450 L70,380 Z" stroke="green" stroke-width="1" fill="none"/>
  <path d="M115,0 L768,110 L686,600 L33,490 Z" stroke="green" stroke-width="1" fill="none"/>
  <rect x="2" y="199" width="585" height="251" stroke="red" fill="none" />
</svg>

That's it: Picasa first crops the original image, then in tilts it and shrinks it to fit into the borders of the
cropped image while keeping the aspect ratio.
