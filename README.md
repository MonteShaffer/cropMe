# cropMe
<blockquote>
<p>A "simple" jQuery image cropping plugin.</p>
</blockquote>

## Update

See http://cropMe.mshaffer.com/ for example, demos, and details.  The website-demo.zip file has all of the files for the demo (including font-awesome and php backend examples of ajax crop, crop-resize, crop-rotate).

1.  A client-side cropping tool should prepare cropping images
	- The tool should enable the user to manipulate an original image
	- The tool should enable the user to preview the final 'cropped' form of the original image
	- The tool should offer support for keyboard, mouse, and text data entry
2.  A client-side cropping tool should be precise
	- The accuracy of the final crop coordinates is of upmost importance
	- The ability to quickly 'tweak' coordinates is essential
	- The ability to visualize the final 'cropped form' is important
3.  A client-side cropping tool should be extensible
	- The tool should be designed to allow for image replacement 
	- The tool should return the final 'cropped' dimensions after every cropping-related movement
	- The tool should easily hackable

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

```position: relative;``` is not required per se, but the jquery plugin will force it to be position: relative ... this is so that we can have absolute elements within ...

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
						consoleLog:  true,  // messages displayed within the tool will also be displayed in the console.log						
						arrowMove: true // move image with arrows , or a side of a box (n,s,e,w)
						},
				timeout: {
						refreshImage: 1000, // in milliseconds						
						toggleControls: 250,  // toggling what controls are displayed
						wheelCapture: 250, // milliseconds: limit wheel speed to prevent zoom too fast 
						//messageLife:  25000, // milliseconds before fades away (unless replaced)...
						showHideCropBox: 1000 // milliseconds for fadeIn, fadeOut
						}, 
				methods: {
						beforeImageLoad: function() {},  // custom function ... [self]
						pluginReady: function() {},  // custom function ... [self] ... layers have been created ... 
						onImageLoad: function() {},  // custom function ... [self]
						onCropFinish: function() {},  // custom function ... [self]
						onFinalPreparation: function() {},  // custom function ... [self] 
						},
				zoom:	{
						initial: "Fit",
						//initial: "0.23",  // values are "Fit", "FitV", "FitV, center center", "FitH", "FitH, center center" where center center can be {left,center,right} {top,center,bottom} or {10px 10px} based on the position within the container (scaled units)
										// can also numeric as a ratio "1" or "0.85, center center"
										// extra elements default to "center center"
						min: 0.05,			// can be a ratio ... will limit the zoom to this amount 
						max: false,		// can be a ratio ... will limit the zoom to this amount [false means no limit]
						wheel:  0.1	// ratio if wheelZoom is true
						}, 
				preview: {
						windowOpenParams: "width=800,height=600, left=100,top=100, toolbar=no, status=no, scrollbars=yes, location=yes, resizable=yes, menubar=no", 
						windowFocus: false,  // if true, popup window will focus 
						windowOpenStyle: {"bg":"black"}
						},
				box:	{
						color: "green",  	// background-color of "modal"
						opacity: 0.75,		// opacity of "modal"
						padding:  5,  // number of pixels (in container scaled units) to pad the box (this box goes over the top of the image container, acting as a modal, and extends beyond the image container ... if the corners of the cropping region are outside the container, on the edge, we can still drag them ... also enables us to have bindings of this modal layer different than the container layer ... mouseover, etc.)
						border: 1, // number of pixels for the crop-box border ... 
						corner:  5,  // number of pixels (in container scaled units) for each drag option ... this will be positioned at each of the 8 locations.
						tolerance: 10, // number of pixels (in container scaled units) from one of these 8 points or a edge line to be considered "arrived" for binding action ... 						
						// units can be original or scaled [container] ... move from 0,0 top/left
						autoPlace: true,
						autoPlaceInfo: {units:"original","x":-75,"y":-450},  // at current zoom, places the background on original position coordinates
						autoMove: false,  // move after it is placed
						autoMoveInfo: {units:"original","x":75,"y":500},  // moves the background image right 50px and down 50px where 50px is based on the actual image size
						// Enable to show the crop box automatically when initialize
						autoCrop: false,
						autoCropInfo: {units:"original","top":100,"left":100,"width":500,"height":500}
						},	
				console: {  // currently at least 600px wide ... width is based on modal overlay ... max-height is 300px
							showControls:  true, 							
							controlPosition:  "bottom",  // top or bottom [TODO: top]
							autoOpen: true,  // show the controls on build ... 						
							openImageInfo:  false,  // if autoOpen is true, this will also auto open
							openBoxInfo:  false, // if autoOpen is true, this will also auto open
							backgroundColor: "white",
							imageBackgroundColor: "#eeeeee",
							boxBackgroundColor: "#cccccc",
							textColor: "black",							
							border: 5,
							heightOpen: 300, // -66 for each "info" row ...
							heightClosed: 25,
							borderColor: "black",
							zoom:  0.1,  // ratio
							moveImage:  10,  // pixels of true image 
							moveCrop:  10,  // pixels of crop box (in container units)
							moveCropEdge:  10,  // pixels of crop box (in container units)
							clickShift:  2,		// factor of zoom/move if "shift" key is held down with the click on the arrow
							clickCntrl:  0.5,   // factor of zoom/move if "control" key is held down with the click on the arrow
							clickAlt:  .1		// factor of zoom/move if "alt" key is held down with the click on the arrow
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
