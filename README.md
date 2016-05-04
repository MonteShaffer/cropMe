# cropMe
<blockquote>
<p>A "simple" jQuery image cropping plugin.</p>
</blockquote>


<pre><code>dist/
├── cropme.css
├── md5.js
├── jquery.cropme.js
└── 
</code></pre>

This is a work in progress, and I emphasize "simple" in quotations because there are other packages that claim that, but when you go to customize the platform, they are far from being extensible.

Jcrop some time ago had some nice functionality, and I have been trying to get along with cropper for some time, but it is not very intuitive, nor extensible.

Cropper has several zoom bugs, and it is difficult to understand what is moving or zooming (the container or the cropbox)?  Also, the fixation on using canvas to crop the data in the browser ... and the fixation on bootstrap.

Anyway, as I result, I have decided to hack away, using ideas from Jcrop/cropper/elevatezoom

The goal is to create a basic cropping plugin that can be used like people expect.

## USAGE

Normally this can all be placed before the ```</HEAD>``` tag.  Advanced users know how to move things around.  The first include is the jquery library (notice version 2+) sorry IE lovers.
The second is a standalone library to compute md5 very fast.  Maybe it isn't needed, but for now, I use it to create unique hashes to cache some dataInfo.
Finally, the jquery pluging cropMe (yes I am an oldschool humpBack guy) followed by a css file.

```
 <script src="https://code.jquery.com/jquery-2.2.3.js"   integrity="sha256-laXWtGydpwqJ8JA+X9x2miwmaiKhn8tVmOVEigRNtP4="   crossorigin="anonymous"></script>
	<script src="js/md5.js"></script>
	<script src="js/jquery.cropme.js"></script>
	<link rel="stylesheet" type="text/css" href="js/cropme.css">
```

<HR />

Now, within the body, you can include a ```<DIV``` with a few required features.  I show two div examples below.  Use one or both.

```
<div data-src="sasha-small.jpg" data-preview="#preview" id="zoom1" style="width: 750px; height: 500px; border: 2px solid red; position: relative;"></div> 

<div data-src="sasha-horizontal.jpg" data-preview=".preview" id="zoom2" style="width: 500px; height: 400px; border: 2px solid red; position: relative;"></div> 
```
The field ```data-src``` is a required attribute and the container size is determined by the ```style: width and style.height```
The id is useful as a selector to initialize, but you could have an army of cropMe instances, if you want.  Why you would ever need multiple on a same page is beyond me.  I wrote this package because I want to use one and "replace" the source URL.
The field ```data-preview``` is optional as a target for one or more preview panes showing the cropBox content.

<HR />
Finally the initiation as a SCRIPT somewhere in the page ... (after jquery hopefully)
```
<SCRIPT>
 $( document ).ready(function() {
          $('#zoom1').cropMe(); 
	        $('#zoom2').cropMe(); 
	});
</SCRIPT>
```
In this case, I initiate two croppers, both based on an id-selector, but a class-selector should also work.

<HR />

The plugin has options .... that can be passed into the main call
```
var options = {timeout:{wheelCapture:1000}};
$('#zoom1').cropMe(options); 
```

or

```
$('#zoom1').cropMe({timeout:{wheelCapture:1000}}); 
```

<HR />
Here are the current default options for the plugin.  
```
$.fn.cropMe.options = {
				enable: {
						wheelZoom: true, // can you zoom with the 3rd mouse button (the wheel)
						cntrlZoom: true, // after mousing over a container, you can use CNTRL- and CNTRL+ to zoom
						arrowsMoveBox: true, 
						cntrlArrowsMoveSide: true,
						toggleDragMode: true		// Toggle drag mode between "crop" and "move" when click twice on the cropper
						},
				timeout: {
						refreshImage: 1000, // in milliseconds
						wheelCapture: 250 // milliseconds: limit wheel speed to prevent zoom too fast
						},
				methods: {
						onImageLoad: function() {},  // custom function ... 
						},
				zoom:	{
						initial: "0.15, center center",  // values are "Fit", "FitV", "FitV, center center", "FitH", "FitH, center center" where center center can be {left,center,right} {top,center,bottom} or {10px 10px} based on the position within the container (scaled units)
										// can also numeric as a ratio "1" or "0.85, center center"
										// extra elements default to "center center"
						min: 0,			// can be a ratio ... will limit the zoom to this amount 
						max: false,		// can be a ratio ... will limit the zoom to this amount [false means no limit]
						wheel:  0.1,	// ratio if wheelZoom is true
						cntrl:  0.1		// ratio of cntrlZoom is true						
						},
				box:	{
						// Show the black modal
						modal: true,
						// Show the dashed lines for guiding
						guides: true,
						// Show the center indicator for guiding
						center: true,
						// Show the white modal to highlight the crop box
						highlight: true,
						// units can be absolute or scaled [container] ... move from 0,0 top/left
						autoMove: true,
						autoMoveInfo: {units:"absolute","x":50,"y":50},  // moves the background image right 50px and down 50px where 50px is based on the actual image size
						// Enable to show the crop box automatically when initialize
						autoCrop: true,
						autoCropInfo: {units:"absolute","top":50,"left":50,"width":500,"height":500}
						},				
				nudge:	{	// pixels or percentage (of the container, not the actual image) 
						moveBox: 10,	// amount if arrowsMoveBox is true
						moveSide: "5%"	// amount if cntrlArrowsMoveSide is true
						}
			};
```

<HR />

The flow is from

<pre><code>
├── init
├── refresh ... fetch (image retrieval with timeout) ... startZoom ... createLayers ... fitZoom ... optional moveTo ... optional drawBox ... optional custom function onImageLoad
├── bind (binding triggers) ... such as wheelZoom (with a timeout), and so on.
└── destroy undoes everything above and returns the universe back to the original DIV state
</code></pre>

<HR />
```option.zoom.initial``` is a very flexible feature of the ```fitZoom``` function.

* **FitH**: Taken from Adobe PDF logic, FitH "fits horizontally" meaning the image fits horizontally in the container
* **FitV**: FitV "fits vertically"
* **Fit**: Either FitH or FitV, smartly computed based on the w/h ratios of the image and container
* **RATIO**: You can also enter a zoom ratio (based on the original image).  The minium value is close to 0 and the maximum can be greater than 1.

<HR />
In addition, you can append a "comma" (,) and placement values.  Default is ```center center```, but all values are calculated on actual pixels (px) not relying on any of the css quirks across browser for "contain" or "cover"


* **FitV, left center**: FitV "fits vertically" placing the image in the left (center is pretty much unnecessary with FitV)
* **FitH, center bottom**: FitH "fits horizontally" placing the image in the bottom (center is pretty much unnecessary with FitH)
* **Fit, 50px 50px**: Fit "fits smartly" placing the image in the top left, moved right 50px and down 50px
* **0.15, left bottom**: RATIO is the zoom level, placed at the left bottom of the container


## Hacking Away ##

I am still hacking away, but a sandbox is available:

http://md5.mshaffer.com/crop-me/_play/

Once I have something a bit more complete, I will checkin a repository.
