/*!
 * cropMe v0.8.1
 * https://github.com/MonteShaffer/cropMe
 *
 * Copyright (c) 2016 Monte J. Shaffer
 * mshaffer @ mshaffer.com
 * Released under the MIT license
 *
 * Date: 2016-05-17 
 */
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}
 
(function( $, window, document, undefined ) {
	// Constants
	var NAMESPACE = 'cropMe';
	
	
	  // Events
		var EVENT_MOUSE_DOWN = 'mousedown touchstart pointerdown MSPointerDown';
		var EVENT_MOUSE_UP = 'mouseup touchend touchcancel pointerup pointercancel MSPointerUp MSPointerCancel';		
		var EVENT_MOUSE_MOVE = 'mousemove touchmove pointermove MSPointerMove';
		var EVENT_DBLCLICK = 'dblclick';	
		var EVENT_CLICK = 'click';
		var EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll MozMousePixelScroll';		
		var EVENT_KEYDOWN = 'keydown';
		var EVENT_KEYPRESS = 'keypress';
		var EVENT_KEYUP = 'keyup';
		var EVENT_MOUSEOVER = 'mouseover';  // mouseenter ... these elements don't consider the children
		var EVENT_MOUSEOUT = 'mouseout';	// mouseleave
	// Browser Checks
	var SUPPORT_CANVAS = $.isFunction($('<canvas>')[0].getContext);
	var IS_SAFARI = navigator && /safari/i.test(navigator.userAgent) && /apple computer/i.test(navigator.vendor);
	// Globals
	var _zIndex = 99;
	var _zIncrement = 3;
	var transparentImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC';
	// background element
	var TEMPLATE = (
    '<div class="cropMe-container" tabindex=0 style="outline: none;">' +
		'<div class="cropMe-background-transparent">' +  // wrap-box
				'<div class="cropMe-background-image"></div>' + // canvas
		'</div>' +		
	 '</div>'
  );
  
  
  var PREVIEW = (
    '<div class="cropMe-preview" style="position: absolute; top: 0px; left: 0px; background-color: white; background-image: none; background-repeat: no-repeat; background-position: 0px 0px; background-size: 0px 0px; width: 0px; height: 0px;"></div>'
  );
	// cropping element
	var BOX = (
	'<div id="{myID}" class="cropMe-cropping" tabindex=0 style="outline: none;">' +		
	'<div class="cropMe-cropping-container">' +
		'<div class="cropMe-drag-box">' +  				
				'<div class="cropMe-pseudo-modal top"></div>' +  
				'<div class="cropMe-pseudo-modal left"></div>' +  
				'<div class="cropMe-pseudo-modal right"></div>' +  
				'<div class="cropMe-pseudo-modal bottom"></div>' +  			
			'<div class="cropMe-crop-box">' +				
			'</div>' +
			'<div class="cropMe-crop-box-controls">' +				
			'</div>' +
			
			'<div class="cropMe-crop-box-drag-border">' +				
			'</div>' +
			
			/**********  These controls are on the outside edge of the crop-box-controls */
			'<span class="cropMe-point point-e" data-action="e"></span>' +
			'<span class="cropMe-point point-n" data-action="n"></span>' +
			'<span class="cropMe-point point-w" data-action="w"></span>' +
			'<span class="cropMe-point point-s" data-action="s"></span>' +
			'<span class="cropMe-point point-ne" data-action="ne"></span>' +
			'<span class="cropMe-point point-nw" data-action="nw"></span>' +
			'<span class="cropMe-point point-sw" data-action="sw"></span>' +
			'<span class="cropMe-point point-se" data-action="se"></span>' +
			/**********  These controls are on the outside edge of the crop-box-controls */
		'</div>' +
    '</div></div>'
  );
		// cropping controls
	var CONTROLS_TOP = (
'<div id="{myID}-controls-interface" class="cropMe-controls-console" style="width: 600px; height: 100%; border: {border}px solid {borderColor};"><form name="{myID}myForm">' +
	'<div id="{myID}-show-hide" style="display: none;">' +
		
		
		'<!-- controls //-->' + 
		'<div id="{myID}-controls" class="cropMe-row-controls" style="height: 60px; background-color: {backgroundColor};">' +
			'<!-- left controls are for the image //-->' +
			'<div class="cropMe-left-controls">' +
					'<!-- image [text zoom] //-->' +
					'<div class="cropMe-inline-control" style="width: 75px;">	' +	
							'<span class="cropMe-center-center">' +
								'<input class="cropMe-input" style="width: 3em;" id="{myID}-image-zoom" onfocus="this.select();" data-status="Manually set the zoom"  />' +
							'</span>' +
					'</div>' +
					'<!-- image [zoom] //-->' +
					'<div class="cropMe-inline-control" style="width: 25px;">	' +					
							'<!-- top left //-->' +
							'<span id="{myID}-image-zoom-in" class="cropMe-zoomIn cropMe-actionable" data-status="Zoom In: Make the Image Larger" style="position: absolute; top: 0px; left: 0px;">' +
								'<i class="fa fa-search-plus fa-lg" aria-hidden="true"></i>' +
							'</span>						' +
							'<!-- bottom left //-->' +
							'<span id="{myID}-image-zoom-out" class="cropMe-zoomOut cropMe-actionable" data-status="Zoom Out: Make the Image Smaller" style="position: absolute; bottom: 0px; left: 0px;">' +
								'<i class="fa fa-search-minus fa-lg" aria-hidden="true"></i>' +
							'</span>' +
					'</div>' +
					'<!-- image info //-->' +
					'<div class="cropMe-inline-control">	' +
							'<span id="{myID}-image-info" class="cropMe-imageInfo cropMe-actionable cropMe-center-bottom" data-status="Show/Hide details about the image">' +
								'<span style="font-size:80%;">' +
									'<span class="fa-stack">' +
									  '<i class="fa fa-circle fa-stack-2x" style="color: {imageBackgroundColor};"></i>' +
									  '<i class="fa fa-info fa-stack-1x fa-inverse" style="color: {textColor};"></i>' +
									'</span>' +
								'</span>' +
							'</span>			' +			
					'</div>' +
					'<!-- image [move] //-->' +
					'<div class="cropMe-inline-control">	' +
							'<!-- left //-->' +
							'<span id="{myID}-image-move-left" class="cropMe-imageMove-left cropMe-actionable cropMe-left-center" data-status="Move the image left {moveImage} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-270" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- right //-->' +
							'<span id="{myID}-image-move-right" class="cropMe-imageMove-right cropMe-actionable cropMe-right-center" data-status="Move the image right {moveImage} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-90" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- center [image] //-->' +
							'<span class="cropMe-center-center">' +
								'<i class="fa fa-picture-o fa-2x" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- up //-->' +
							'<span id="{myID}-image-move-up" class="cropMe-imageMove-up cropMe-actionable cropMe-center-top" data-status="Move the image up {moveImage} pixels">' +
								'<i class="fa fa-sort-asc" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- down //-->' +
							'<span id="{myID}-image-move-down" class="cropMe-imageMove-down cropMe-actionable cropMe-center-bottom" data-status="Move the image down {moveImage} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-180" aria-hidden="true"></i>' +
							'</span>' +
				'</div>' +
			'</div>' +
			'<!-- right controls are for the crop box //-->' +
			'<div class="cropMe-right-controls">		' +	
					'<div class="cropMe-inline-control">	' +		
						'<!-- toggle inline controls //-->' +
						'<!-- crop highlight toggle //-->' +
							'<span id="{myID}-box-toggle-controls" class="cropMe-boxToggleControls cropMe-actionable cropMe-center-top" data-status="Turn on/off the inline controls to adjust the crop box [Toggle cropping and cropped].">' + 
								'<i class="fa fa-toggle-on fa-flip-horizontal" aria-hidden="true" style="color: grey;"></i>' +
							'</span>' +
						'<!-- toggle aspect ratio //-->' +
							'<span id="{myID}-box-toggle-ratio" class="cropMe-boxToggleRatio cropMe-actionable cropMe-center-bottom" data-status="Turn on/off the locking of an aspect ratio (If unlocked, Cntrl-drag will still constrain aspect ratio).">' + 
								'<i class="fa fa-unlock" aria-hidden="true"></i>' +
							'</span>' +
					'</div>' +
					'<!-- crop box [move] //-->' +
					'<div class="cropMe-inline-control">	' +
							'<!-- left //-->' +
							'<span id="{myID}-box-move-left" class="cropMe-boxMove-left cropMe-actionable cropMe-left-center" data-status="Move the crop box left {moveCrop} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-270" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- right //-->' +
							'<span id="{myID}-box-move-right" class="cropMe-boxMove-right cropMe-actionable cropMe-right-center" data-status="Move the crop box right {moveCrop} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-90" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- center [crop] //-->' +
							'<span class="cropMe-center-center">' +
								'<i class="fa fa-crop fa-lg" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- up //-->' +
							'<span id="{myID}-box-move-up" class="cropMe-boxMove-up cropMe-actionable cropMe-center-top" data-status="Move the crop box up {moveCrop} pixels">' +
								'<i class="fa fa-sort-asc" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- down //-->' +
							'<span id="{myID}-box-move-down" class="cropMe-boxMove-down cropMe-actionable cropMe-center-bottom" data-status="Move the crop box down {moveCrop} pixels">' +
								'<i class="fa fa-sort-asc fa-rotate-180" aria-hidden="true"></i>' +
							'</span>' +
					'</div>' +
					'<!-- crop info & wand //-->' +
					'<div class="cropMe-inline-control">	' +
							'<span id="{myID}-box-info" class="cropMe-imageInfo cropMe-actionable cropMe-center-bottom" data-status="Show/Hide details about the crop box">' +
								'<span style="font-size:80%;">' +
									'<span class="fa-stack">' +
									  '<i class="fa fa-circle fa-stack-2x" style="color: {boxBackgroundColor};"></i>' +
									  '<i class="fa fa-info fa-stack-1x fa-inverse" style="color: {textColor};"></i>' +
									'</span>' +
								'</span>		' +
							'</span>' +
							'<!-- wand //-->' +
							//'<span id="{myID}-box-zoom-wand" class="cropMe-boxWand cropMe-actionable cropMe-center-bottom" data-status="Use \'smart wand\' to zoom in on crop box">' +
								//'<i class="fa fa-magic fa-flip-horizontal" aria-hidden="true"></i>' +
							//'</span>' +
					'</div>' +
					'<!-- crop edges [move] //-->' +
					'<div class="cropMe-inline-control">	' +
							'<!-- left //-->' +
							'<span class="cropMe-left-center">' +
								'<span style="font-size:50%;">' +
									'<div id="{myID}-boxedge-move-left-plus" class="cropMe-boxMoveEdge-left-plus cropMe-actionable" data-status="Move the crop box left edge +{moveCropEdge} pixels"   ><i class="fa fa-step-forward" aria-hidden="true"></i></div>' +
									'<div id="{myID}-boxedge-move-left-minus" class="cropMe-boxMoveEdge-left-minus cropMe-actionable" data-status="Move the crop box left edge -{moveCropEdge} pixels"   ><i class="fa fa-step-backward" aria-hidden="true"></i></div>' +
								'</span>' +
							'</span>' +
							'<!-- right //-->' +
							'<span class="cropMe-right-center">' +
								'<span style="font-size:50%;">' +
									'<div id="{myID}-boxedge-move-right-plus" class="cropMe-boxMoveEdge-right-plus cropMe-actionable" data-status="Move the crop box right edge +{moveCropEdge} pixels"   ><i class="fa fa-step-forward" aria-hidden="true"></i></div>' +
									'<div id="{myID}-boxedge-move-right-minus" class="cropMe-boxMoveEdge-right-minus cropMe-actionable" data-status="Move the crop box right edge -{moveCropEdge} pixels"   ><i class="fa fa-step-backward" aria-hidden="true"></i></div>' +
								'</span>' +
							'</span>' +
							'<!-- center [crop] //-->' +
							'<span class="cropMe-center-center">' +
								'<i class="fa fa-crop" aria-hidden="true"></i>' +
							'</span>' +
							'<!-- up //-->' +
							'<span class="cropMe-center-top" style="transform: translateX(-50%) translateY(-33%);">' +
								'<span style="font-size:50%;">' +
									'<span id="{myID}-boxedge-move-up-plus" class="cropMe-boxMoveEdge-up-plus cropMe-actionable" data-status="Move the crop box up edge +{moveCropEdge} pixels"   ><i class="fa fa-step-forward fa-rotate-90" aria-hidden="true"></i></span> &nbsp; ' +
									'<span id="{myID}-boxedge-move-up-minus" class="cropMe-boxMoveEdge-up-minus cropMe-actionable" data-status="Move the crop box up edge -{moveCropEdge} pixels"   ><i class="fa fa-step-backward fa-rotate-90" aria-hidden="true"></i></span>' +
								'</span>' +
							'</span>' +
							'<!-- down //-->' +
							'<span class="cropMe-center-bottom" style="transform: translateX(-50%) translateY(25%);">' +
								'<span style="font-size:50%;">' +
									'<span id="{myID}-boxedge-move-down-plus" class="cropMe-boxMoveEdge-down-plus cropMe-actionable" data-status="Move the crop box down edge +{moveCropEdge} pixels"   ><i class="fa fa-step-forward fa-rotate-90" aria-hidden="true"></i></span> &nbsp; ' +
									'<span id="{myID}-boxedge-move-down-minus" class="cropMe-boxMoveEdge-down-minus cropMe-actionable" data-status="Move the crop box down edge -{moveCropEdge} pixels"   ><i class="fa fa-step-backward fa-rotate-90" aria-hidden="true"></i></span>' +
								'</span>' +
							'</span>' +
					'</div>	' +
					'<!-- crop box [on / off] //-->' +
					'<div class="cropMe-inline-control" style="width: 75px;">	' +	
							'<DIV id="{myID}-box-status" class="cropMe-center-center">' +
								'<DIV id="{myID}-box-status-on-msg" data-status="Enable the crop box (turn it on)">' +
									'<label class="cropMe-label-small" for="{myID}-box-status-on">On:</label>	' +
									'<input id="{myID}-box-status-on" type="radio" value="on" name="{myID}boxStatus" />' +
								'</DIV>' +
								'<DIV id="{myID}-box-status-off-msg" data-status="Disable the crop box (turn it off)">' +
									'<label class="cropMe-label-small" for="{myID}-box-status-off">Off:</label>	' +
									'<input id="{myID}-box-status-off" type="radio" value="off" name="{myID}boxStatus" />' +
								'</DIV> ' +
							'</DIV>' +
					'</div>' +
			'</div> <!-- right controls are for the crop box //-->' +
		'</div><!-- // {myID}-controls //-->' +
		
		'<!-- box-info-row2 //-->' +
		'<div id="{myID}-box-info-row2" class="cropMe-row-controls" style="background-color: {boxBackgroundColor}; display: none;">	' +
			'<div class="cropMe-icons-controls">' +
				'<span class="cropMe-top-left" style="color: #999999;">' +
					'&nbsp;<i class="fa fa-crop" aria-hidden="true"></i>' +
				'</span>	' +
			'</div>' +
			'<div class="cropMe-inline-control-info">'+
				//	'<u>Position</u>' +
				//'<div>			' +
				//	'<label class="cropMe-label" for="{myID}-image-top">Top:</label>	' +
				//	'<input class="cropMe-input" id="{myID}-image-top" data-status="Change the crop box \'top\' position (move the box up or down)" onfocus="this.select();" />		' +
				//'</div>' +
				//'<div>			' +
				//	'<label class="cropMe-label" for="{myID}-image-left">Left:</label>	' +
				//	'<input class="cropMe-input" id="{myID}-image-left" data-status="Change the crop box \'left\' position (move the box left or right)" onfocus="this.select();" />	' +
				//'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info"><u>(Original) Size</u>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-w">Width:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-w" data-status="Change the image cropped region \'width\' (wider or narrower, left is fixed)" onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-h">Height:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-h" data-status="Change the image cropped region \'height\' (taller or shorter, top is fixed)" onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info" style="width: 20%;"><u>Image Cropped</u>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-x1">x1:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-x1" data-status="Change the image cropped region \'x1\' (wider or narrower, x2 is fixed)"  onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-y1">y1:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-y1" data-status="Change the image cropped region \'y1\' (taller or shorter, y2 is fixed)"  onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info" style="width: 20%;">' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-x2">x2:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-x2" data-status="Change the image cropped region \'x2\' (wider or narrower, x1 is fixed)" onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-y2">y2:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-y2" data-status="Change the image cropped region \'y2\' (taller or shorter, y1 is fixed)"  onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<!-- box-info-row //-->' +
		'<div id="{myID}-box-info-row" class="cropMe-row-controls" style="background-color: {boxBackgroundColor}; display: none;">	' +
			'<div class="cropMe-icons-controls">' +
				
			'</div>' +
			'<div class="cropMe-inline-control-info">'+
				//	'<u>Position</u>' +
				//'<div>			' +
				//	'<label class="cropMe-label" for="{myID}-box-top">Top:</label>	' +
				//	'<input class="cropMe-input" id="{myID}-box-top" data-status="Change the crop box \'top\' position (move the box up or down)" onfocus="this.select();" />		' +
				//'</div>' +
				//'<div>			' +
				//	'<label class="cropMe-label" for="{myID}-box-left">Left:</label>	' +
				//	'<input class="cropMe-input" id="{myID}-box-left" data-status="Change the crop box \'left\' position (move the box left or right)" onfocus="this.select();" />	' +
				//'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info"><u>(Container) Size</u>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-w">Width:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-w" data-status="Change the crop box \'width\' (wider or narrower, left is fixed)" onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-h">Height:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-h" data-status="Change the crop box \'height\' (taller or shorter, top is fixed)" onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info" style="width: 20%;"><u>Coordinates</u>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-x1">x1:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-x1" data-status="Change the crop box \'x1\' (wider or narrower, x2 is fixed)"  onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-y1">y1:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-y1" data-status="Change the crop box \'y1\' (taller or shorter, y2 is fixed)"  onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info" style="width: 20%;">' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-x2">x2:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-x2" data-status="Change the crop box \'x2\' (wider or narrower, x1 is fixed)" onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-box-y2">y2:</label>	' +
					'<input class="cropMe-input" id="{myID}-box-y2" data-status="Change the crop box \'y2\' (taller or shorter, y1 is fixed)"  onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +
		'</div>' +
		
		'<!-- image-info-row //-->' +
		'<div id="{myID}-image-info-row" class="cropMe-row-controls" style="background-color: {imageBackgroundColor}; display: none;">	' +
			'<div class="cropMe-icons-controls">' +
				'<span class="cropMe-top-left" style="color: #999999;">' +
					'&nbsp;<i class="fa fa-picture-o" aria-hidden="true"></i>' +
				'</span>	' +
			'</div>' +
			'<div class="cropMe-inline-control-info">'+
					'<u>(Image) Position</u>' +
				
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-left">Left:</label>' +	
					'<input class="cropMe-input" id="{myID}-image-left" data-status="Change the image \'left\' position (move the image left or right)"  onfocus="this.select();" />	' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-top">Top:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-top" data-status="Change the image \'top\' position (move the image up or down)" onfocus="this.select();" />		' +
				'</div>' +
			'</div>' +
			'<div class="cropMe-inline-control-info">' + //<u>Size</u>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-width">Width:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-width" data-status="Change the image \'width\' (wider or narrower, will alter zoom)" onfocus="this.select();" />' +
				'</div>' +
				'<div>			' +
					'<label class="cropMe-label" for="{myID}-image-height">Height:</label>	' +
					'<input class="cropMe-input" id="{myID}-image-height" data-status="Change the image \'height\' (taller or shorter, will alter zoom)" onfocus="this.select();" />	' +
				'</div>' +
			'</div>' +			
		'</div>' +
	'</div><!-- // show-hide //-->' +
	'<div class="cropMe-toggle-message">' +
		'<div style="float: left;">' +
			'<div id="{myID}-message"> </div>' +
		'</div>' +
		'<div id="{myID}-toggle" data-status="Show/Hide the Console" style="float: right; vertical-align: middle;">' +
			'<i class="fa fa-level-up" aria-hidden="true"></i>' +
		'</div>' +
	'</div>' +
'</form>' + 
'</div><!-- // {myID}-controls-interface //-->'
  );
	
	var cropMe = 
		{
		init: function( options, elem ) {
			var self = this;
			self.elem = elem;
			//self.theSelector = elem.id;
			self.$elem = $( elem );					
			self.isActive = false;		// hovered over image [so Cntrl-Zoom works]
			
			self.currentImage = false;
			self.finalPrepared = false;
			
			self.hasInitialized = false;
//console.log("READY: " + self.isReady());
			self.zoomActivate = true;  // zoomTo or just calculate ... 
				self.isDrawingBox		= false; // start / drag / stop
				self.isMovingBackground	= false; // start / drag / stop
				
				
				self.isResizingBox		= false;  	// todo
				self.isMovingBox		= false;	// todo
				self.whatIsDragging 	= false;
				
// box has an overlay modal, and crop-area with pseudo-modals ...
				self.hasModal		= true; // is the modal active (on/off radio)
				self.hasBox			= false; // does a crop box exist
				self.isBoxVisible	= false; // is the crop box visible 
				self.isBoxActive 	= false;	// hovered over crop box [so Cntrl-Zoom works]
				
					// maybe above hover on active attaches to visible
					// active means I have active controls for moving/resizing the cropbox...  on finish drag, the controls appear...
					// if I click inside the crop region, I can move the crop box... If I click outside the crop region (pseudo modals), I can draw a new drop box ... If I am in the psueudo region, and CNTRL-click, I can move the background image ...
				
			self.zIndex = _zIndex;  
			self.zIncrement = _zIncrement; 
			self.myPoints = resetObject("myPoints");  // data of points [history]
//console.log(_myPoints);
//console.log(self);
			self.dragData = resetObject("dragData"); // initial empty values ...
			self.dragDataBackup = {};
		self.dragDataBackup["initial"] = resetObject("dragData");			
			self.zoomHistory = {};
			self.boxRatio = false;
			self.maintainAspectRatio = false;
			self.forceAspectRatio = false;
			self.boxAction = "crop";  // move-image, move-box, move-point
			self.toggleBoxControls	= "edges";  // or none
							
			self.imageSrc	= self.$elem.data("src"); // required form				
				var offset = self.$elem.offset();
					self.containerOffsetTop = offset.top;
					self.containerOffsetLeft = offset.left;
			self.offset		= offset;
			// remove hover attributes ... if they exist ...
			self.$elem.parent().removeAttr('title').removeAttr('alt');
			self.zoomImage = self.previewImage = self.imageSrc;
			self.$elem.css("position", "relative");  // must be relative, so elements inside can be absolute
			
			self.options = $.extend(true,  {}, $.fn.cropMe.options, options ); // load options
			
				// waiting
				self.$elem.css("cursor", "progress");
			
			// refresh image ... with timeout // also fetches image and sets initial zoom
			self.start();
				// done waiting 
				self.$elem.css("cursor", "default");
			return self;
			},
		isReady: function() {  // are the layers created and the cropper ready to go?
				var self = this;
					return (!empty(self.currentImage));
				return self;
			},
		resizeContainer: function( w,h ) {
				var self = this;
					
				if(self.isReady())
				{
				if(w == "") {  w = self.$elem.width(); } else { self.$elem.width(w); }
				if(h == "") {  h = self.$elem.height(); } else { self.$elem.height(h); }		
						
					self.startZoom(); // sets all ratios ...
					// shouldn't change, but maybe ... 
						var offset = self.$elem.offset();
					self.containerOffsetTop = offset.top;
					self.containerOffsetLeft = offset.left;
					
				var obj = self.$elem.find(".cropMe-background-transparent");	
					obj.width(w);
					obj.height(h);
				var obj = self.$elem.find(".cropMe-background-image");
					obj.width(w);
					obj.height(h);
				
self.cssFunctions("#"+self.myID,"box",false);
						self.boxWidth = self.$box.width();
						self.boxHeight = self.$box.height();
					var offset = self.$box.offset();
						self.boxOffsetLeft = offset.left;
						self.boxOffsetTop = offset.top;
										
self.cssFunctions("#"+self.myID+"-controls-interface","console",false); 
					self.fitZoom();
					
					// bug ... sometimes the border doesn't show?
					if( $("#"+self.myID+"-show-hide").length > 0)
						{
						self.$controls.css({"max-height": computeToggleHeight(self) + "px"});
						}

					// if cropper active let's kill it ... 
					if(self.hasBox)
						{
						self.hasBox = false;
						self.resetBox();
						self.toggleBoxControls = "none";
						}
				}
						
			return self;
			},	
		replaceImage: function( src ) {
				var self = this;
					if(self.isReady())
				{
					if(src == "") 
						{ 
						src = self.$elem.data("src"); 
						} 
						else 
							{
							self.$elem.data("src",src);
							}
					self.currentImage = false;
					self.initImage();
					self.start();
					// if cropper active
					if(self.hasBox)
						{
						self.cropVerify();	
						// self.cropPreview();
						}
				}
						
			return self;
			},	
		initImage: function(  ) {
				var self = this;
					self.imageSrc	= self.$elem.data("src"); // required form	
					self.zoomImage  = self.previewImage = self.imageSrc;
					self.startZoom(); // sets all ratios ...
					self.fitZoom();
			return self;
			},	
		start: function(  ) {
				var self = this;
				var length = 1;
				setTimeout(function() {self.fetch(self.imageSrc);}, length || self.options.timeout.refreshImage );
			return self;
			},	
		fetch: function () {
				var self = this;
				var newImg = new Image();
					self.options.methods.beforeImageLoad(self);
				newImg.onload = function() {
					//set the large image dimensions - used to calculte ratio's
					self.largeWidth =  newImg.naturalWidth || newImg.width;
					self.largeHeight =  newImg.naturalHeight || newImg.height;
					
					
					if(empty(self.md5))  // if we replace the image, we can just call start again ... everything built stays in place ... see function replaceImage
						{
						self.md5 = md5(self.elem + self.imageSrc); // unique identifier
						self.myID = "Q" + self.md5; // md5 can start with a number, bad so append a "Q".
						
						//once image is loaded start the calls
						self.startZoom();
							self.createLayers();
							self.fitZoom();
								//	self.zoomTo(1);
							//self.fitZoom();
						if(self.options.box.autoPlace)
							{
							// TO REDO
							// self.placeImage(self.options.box.autoPlaceInfo);
							//self.moveTo(self.options.box.autoPlaceInfo.x,self.options.box.autoPlaceInfo.y,self.options.box.autoPlaceInfo.units);
							}
						if(self.options.box.autoMove)
							{
							// TO REDO
							//self.moveBox(self.options.box.autoMoveInfo);
							//self.moveDelta(self.options.box.autoMoveInfo.x,self.options.box.autoMoveInfo.y,self.options.box.autoMoveInfo.units);
							}
						if(self.options.box.autoCrop)
							{
								// TO REDO
							//self.drawBox(self.options.box.autoCropInfo);
							}		
							// with above, // todo [smartPlace and smartBox] which makes certain "isInBounds" and is centered with some amount of border ... 
						
						self.options.methods.pluginReady(self); // everything
						self.hasInitialized = true;
						}
						else
							{
							// the plugin objects exist, just update the image src...
							var obj = self.$elem.find(".cropMe-background-image");
							obj.css({"background-image": "url("+self.imageSrc+")"});
							}
					
					
					self.currentImage = self.imageSrc;
					self.doMessage("cropMe READY: " + self.imageSrc + " has loaded.");
//console.log("READY: " + self.isReady());
						self.updateConsole();
					
					//let caller know image has been loaded
					// self.options.methods.onImageLoad(self.$elem); // just the object, not the extra stuff, or everything?
					self.options.methods.onImageLoad(self); // everything
					
					
					
					
				}
				newImg.src = self.imageSrc; // this must be done AFTER setting onload
				return self;
			},
						createLayers: function( ) {
								var self = this;	
								// TEMPLATE [background image with transparency]
								//self.$template = $template = $(TEMPLATE);
								$template = $(TEMPLATE);
								self.$elem.append( $template );
								self.$template = self.$elem.find("DIV.cropMe-container");
//console.log(self.$template);
								
						// APPEND CONTROLS TO THE DOCUMENT... 
							
					if(self.options.console.showControls)
									{
									var controls = CONTROLS_TOP;
										controls = controls.split("{myID}").join(self.myID);
										controls = controls.split("{boxBackgroundColor}").join(self.options.console.boxBackgroundColor);
										controls = controls.split("{textColor}").join(self.options.console.textColor);
										controls = controls.split("{imageBackgroundColor}").join(self.options.console.imageBackgroundColor);
										controls = controls.split("{borderColor}").join(self.options.console.borderColor);
										controls = controls.split("{border}").join(self.options.console.border);
										
										controls = controls.split("{moveImage}").join(self.options.console.moveImage);
										controls = controls.split("{moveCrop}").join(self.options.console.moveCrop);
										controls = controls.split("{moveCropEdge}").join(self.options.console.moveCropEdge);
										
										
										controls = controls.split("{backgroundColor}").join(self.options.console.backgroundColor);										
									$controls = $(controls);										
									$(document.body).append( $controls );									
									self.$controls = $("#"+self.myID+"-controls-interface");	
									
									
									
									
					
																			
									if(self.options.console.openImageInfo)
										{
										$("#"+self.myID+"-image-info-row").show();
										}
									if(self.options.console.openBoxInfo)
										{
										$("#"+self.myID+"-box-info-row").show();
										$("#"+self.myID+"-box-info-row2").show();
										}
										
									if(self.options.console.autoOpen)
										{
										$("#"+self.myID+"-show-hide").show();
										}
										
									
									eval("var dfe = document."+self.myID+"myForm."+self.myID+"boxStatus;");
									setCheckedValue(dfe,"on");
			
									setTimeout(function() { self.$controls.css({"max-height": computeToggleHeight(self) + "px"}); }, self.options.timeout.toggleControls );
									}
									
								// BOX [after controls, also appended to body, in case z-index is undefined]	
									var box = BOX.split("{myID}").join(self.myID);
								$box = $(box);
								// http://stackoverflow.com/questions/13147757/chrome-doesnt-respect-the-z-index-order
								//self.$elem.before( $box ); // outside of the container element, attached to "body"
								$(document.body).append( $box );	
								
								self.$box = $("#"+self.myID);
								
								self.$pseudo = $("#"+self.myID +" > DIV.cropMe-pseudo-modal");
								//self.$crop   = $("#"+self.myID +" > DIV > DIV > DIV.cropMe-crop-box");	
								//self.$pseudo = $("#"+self.myID +" DIV.cropMe-pseudo-modal");
								self.$crop	= $("#"+self.myID +" DIV.cropMe-crop-box");
								self.$edges	= $("#"+self.myID +" DIV.cropMe-crop-box-controls");
								self.$dragborder	= $("#"+self.myID +" DIV.cropMe-crop-box-drag-border");
									
								self.updateCSS();
									
									// order is important, this needs to go after updateCSS
										self.boxWidth = self.$box.width();
										self.boxHeight = self.$box.height();
									var offset = self.$box.offset();
										self.boxOffsetLeft = offset.left;
										self.boxOffsetTop = offset.top;
									
									
									
									
									// the elements are built and initialized, now let's create binding actions
									self.bind();
								return self;						
							},
		updateCSS: function () {
			var self = this;
				// stylize transparent background
				self.cssFunctions(".cropMe-background-transparent","background-transparent");
				// stylize background image
				self.cssFunctions(".cropMe-background-image","background-image");
				// stylize box [modal, crop, pseudo]	
					self.zIndexBox = self.zIndex;
				self.cssFunctions("#"+self.myID,"box",false);
					self.zIndex += self.zIncrement;
				// stylize console 	
					self.zIndexConsole = self.zIndex;
				self.cssFunctions("#"+self.myID+"-controls-interface","console",false); 
					self.zIndex += self.zIncrement;
					
				// stylize box [set relative]
				self.cssFunctions("#"+self.myID+" DIV.cropMe-cropping-container","box-relative",false);
				
				// stylize box [pseudo]
					self.zIndexPseudo = self.zIndex + self.zIncrement;
							self.zIndex = self.zIndexPseudo;
				self.cssFunctions("#"+self.myID+" DIV.cropMe-pseudo-modal","box-pseudo",false);		
				
					self.zIndex += self.zIncrement;
					
					self.zIndexEdges = self.zIndex + 1;
				// stylize [crop-box controls] cropMe-crop-box-controls
				self.cssFunctions("#"+self.myID+" DIV.cropMe-crop-box-controls","box-crop-controls",false);	
				
				self.cssFunctions("#"+self.myID+" DIV.cropMe-crop-box-drag-border","box-crop-controls",false);	
			
			return self;
			},
		cssFunctions: function( selector, action, local=true ) {
			var self = this;				
				var search = (local) ? self.$elem : $(document.body);
				var obj = search.find(selector);				
//console.log("selector: " + selector + " -> length: " + obj.length);				
				switch(action)
					{
					case "box-relative":
						obj.css({ 
									"position": "relative",
									});
					break;
					case "box-white":
						obj.css({ 
									"background-color": self.options.box.color
									});
					break;
					case "box-transparent":
						obj.css({ 
									"background-color": "transparent"
									});
					break;					
					case "box-crop-controls":
						obj.css({ 
									"position": "absolute",
									"top": "0px",
									"right": "0px",  	/* necessary? */
									"bottom": "0px",	/* necessary? */
									"left": "0px",
									"width": "0px",
									"height": "0px",
									"display": "none",
									"z-index":  self.zIndex
									});					
					break;
					case "box-pseudo":
						obj.css({ 
									"position": "absolute",
									"top": "0px",
									"right": "0px",  	/* necessary? */
									"bottom": "0px",	/* necessary? */
									"left": "0px",
									"width": "0px",
									"height": "0px",
									"z-index":  self.zIndexPseudo,
									"background-color": self.options.box.color,
									"opacity": self.options.box.opacity,
									"filter": "alpha(opacity="+(100*self.options.box.opacity)+")"
									});					
					break;	
					case "console":		
						var x = self.containerOffsetLeft - self.options.box.padding;
						var y = self.containerOffsetTop - self.options.box.padding;
							y += 2 * self.options.box.padding + self.containerHeight;
						var w = self.containerWidth + 2 * self.options.box.padding - 2 * self.options.console.border;
							obj.css({ 
									"background-color":  self.options.console.borderColor,
									"position": "absolute",
									"top": y + "px",
									"right": "0px",  	/* necessary? */
									"bottom": "0px",	/* necessary? */
									"left": x + "px",
									"max-height": self.options.console.heightOpen + "px",
									"z-index":  self.zIndexConsole
									});
							obj.width(w);
					break;					
					case "box":											
						var x = self.containerOffsetLeft - self.options.box.padding;
						var y = self.containerOffsetTop - self.options.box.padding;
						var w = (2 * self.options.box.padding) + self.containerWidth;
						var h = (2 * self.options.box.padding) + self.containerHeight;
							obj.css({ 
									"position": "absolute",
									"top": y + "px",
									"right": "0px",  	/* necessary? */
									"bottom": "0px",	/* necessary? */
									"left": x + "px",
									"z-index":  self.zIndexBox,
									"background-color": self.options.box.color,
									"filter": "alpha(opacity="+(100*self.options.box.opacity)+")",
									"opacity": self.options.box.opacity
									});
							obj.width(w);
							obj.height(h);
					break;					
					case "background-image":
						var w = self.containerWidth;
						var h = self.containerHeight;
							obj.css({ 
									"background-repeat": "no-repeat",
									"background-image": "url("+self.imageSrc+")"
									});
							obj.width(w);
							obj.height(h);
					break;
					case "background-transparent":
						var w = self.containerWidth;
						var h = self.containerHeight;
							obj.css({
									"background-image": "url("+transparentImage+")"
									});
							obj.width(w);
							obj.height(h);
					break;		
					}
			return self;
			},
		startZoom: function( ) {
			var self = this;
				//get dimensions of the non zoomed container
				self.containerWidth = self.$elem.width();
				self.containerHeight = self.$elem.height();
				
				// store all ratios
				self.ratioContainer = self.containerWidth / self.containerHeight;
				self.ratioImage		= self.largeWidth / self.largeHeight;
				self.ratioX = self.containerWidth/self.largeWidth;
				self.ratioY = self.containerHeight/self.largeHeight;
				self.ratioXY = self.ratioX/self.ratioY;
				self.ratioYX = self.ratioY/self.ratioX;
			return self;
			},
		fitZoom: function( ) {
			var self = this;
				var which = self.options.zoom.initial;
					which = which.toLowerCase();
				var wA = which.split(",");
				var fit = trim(wA[0]);
					self.currentFit = fit;
				var place = isset(wA[1]) ? trim(wA[1]) : "center center";
					self.currentPlace = place;
				// even though we say "center center" ... we actually place everything in pixels (px)...
					self.fitZoomSize(fit);										
						var size = self.currentSize;
					self.fitZoomPlace(place);
						var position = self.currentPosition;
				var obj = self.$elem.find(".cropMe-background-image");
					obj.css({ 
							"background-size":  size,
							"background-position": position
							});
				var key = "" + getMilliseconds() + "-initial";
				self.zoomHistory[key] = {zoom: self.zoomFactor, w: self.sizeX, h: self.sizeY, top: self.placeX, left: self.placeY, element: self.zoomElement, which: which, fit: self.currentFit, size: size, place: place, position: position };
			return self;
			},	
		fitZoomSize:  function(fit) {
			var self = this;
				var size = ""; var sizeX = 0; var sizeY = 0; 
				var zoomFactor = 1; var zoomElement = "";
				// determine sizeX, sizeZ, and zoomFactor
				switch(fit)
					{
					default:  // fit is a numeric ratio as original zoom of the image
						if(validNumber(fit))
							{
							zoomFactor = checkZoomBoundary(fit, self);
							}
							// we now perform "fit" ...  // background-size
								self.zoomActivate = false; // zoom without being active
							self.zoomTo(zoomFactor); // we don't have position to implement yet ...
								self.zoomActivate = true;  // zoom will now be active
							sizeX = self.sizeX;
							sizeY = self.sizeY;
					break;
					case "fit":  // based on ratios (container vs image), will do fith or fitv
						if(self.ratioContainer >= self.ratioImage)
							{
							zoomElement = "ratioY";
							zoomFactor	= self.ratioY;
							sizeY		= self.containerHeight;
							sizeX		= zoomFactor * self.largeWidth;
							}
						// if container is tall and image is long, we do fith
							else
								{
								zoomElement = "ratioX";
								zoomFactor	= self.ratioX;
								sizeX		= self.containerWidth;
								sizeY		= zoomFactor * self.largeHeight;
								}
					break;
					case "fith":
						zoomElement = "ratioX";
						zoomFactor	= self.ratioX;
						sizeX		= self.containerWidth;
						sizeY		= zoomFactor * self.largeHeight;
					break;
					case "fitv":	
						zoomElement = "ratioY";
						zoomFactor	= self.ratioY;
						sizeY		= self.containerHeight;
						sizeX		= zoomFactor * self.largeWidth;
					break;
					}
				size =  sizeX + "px " + sizeY+ "px";
					self.currentSize = size;
					self.currentFit = fit;
					self.sizeX = sizeX;
					self.sizeY = sizeY;
					self.zoomElement	= zoomElement;
					self.zoomFactor		= zoomFactor;
			return self;
			},
		fitZoomPlace:  function(place = "center") {
			var self = this;
				// size is already known, "center center" becomes x,y units
				// if crop box is active, we will zoom so it is still highlighting the same content ... and fits in the container ... 
				var sizeX = self.sizeX; var sizeY = self.sizeY; var position = "";
				var placeX = 0; var placeY = 0;	
				
				var pA = place.split(" ");
						var placeH = trim(pA[0]); var placeV = isset(pA[1]) ? trim(pA[1]) : "center";
							switch(placeH)
								{
								default:  // numeric
									placeX = trim(placeH.split("px").join(""));
										if(!validNumber(placeX)) {placeX = 0;}
									placeX = parseFloat(placeX);
								break;						
								case "left":
									placeX = 0;
								break;
								case "center":
									var space = self.containerWidth - sizeX;
									placeX = space/2;
								break;
								case "right":
									var space = self.containerWidth - sizeX;
									placeX = space;
								break;
								}
							switch(placeV)
								{
								default:  // numeric
									placeY = trim(placeV.split("px").join(""));
										if(!validNumber(placeY)) {placeY = 0;}
									placeY = parseFloat(placeY);
								break;						
								case "top":
									placeY = 0;
								break;
								case "center":
									var space = self.containerHeight - sizeY;
									placeY = space/2;
								break;
								case "bottom":
									var space = self.containerHeight - sizeY;
									placeY = space;
								break;
								}
					
				position =  placeX + "px " + placeY+ "px";
									
					self.currentPosition = position;
					self.currentPlace = position; // update
					self.placeX = placeX;
					self.placeY = placeY;
			return self;
			},
		imagePlace: function(t,l, w,h, key=""){  // place image based on original values ...
			var self = this;
				if(key == "") { key = getMilliseconds(); } else { key = "" + getMilliseconds() + "-" + key; }
				self.sizeX = parseFloat(w);	self.placeX = parseFloat(l);				
				self.sizeY = parseFloat(h);	self.placeY = parseFloat(t);
					var zoomFactor = w / self.largeWidth;
						self.zoomFactor = zoomFactor;
				
				/* position =  placeX + "px " + placeY+ "px";
					self.currentPosition = position;
					self.currentPlace = position; // update
					*/
//console.log("imagePlace-> t: " + t + " l: " + l + " w: " + w + " h: " + h + " key: " + key);
				// we assume everything is good to go
					var size =  self.sizeX + "px " + self.sizeY+ "px";
					var position =  self.placeX + "px " + self.placeY+ "px";
							self.currentPosition = position;
							self.currentPlace = position; // update
					var obj = self.$elem.find(".cropMe-background-image"); 
								obj.css({ 
										"background-size":  size,
										"background-position": position
										});	
										
					self.zoomHistory[key] = {zoom: zoomFactor, w: self.sizeX, h: self.sizeY, top: self.placeX, left: self.placeY, element: self.zoomElement, fit: self.currentFit, size: size, place: self.currentPlace, position: position };
					
					//self.updateConsole();
					self.cropVerify();			
			return self;
			},
		zoomTo: function (zoomFactor,key="") {  // original zoom of background element
			var self = this;
				if(key == "") { key = getMilliseconds(); } else { key = "" + getMilliseconds() + "-" + key; }
//console.log("zoomTo: " + zoomFactor + " ... " + key );
					// zoomFactor = checkZoomBoundary(zoomFactor, self);
					zoomFactor = checkZoomBoundary(zoomFactor, self);
				var sizeX = self.largeWidth * zoomFactor; // ???
				var sizeY = self.largeHeight * zoomFactor;
					self.sizeX = sizeX;
					self.sizeY = sizeY;
				var size =  sizeX + "px " + sizeY+ "px";
					self.currentSize = size;
				if(self.zoomActivate)
					{
					// we have size, let's manipulate place/position
					self.fitZoomPlace(self.currentPlace);
						var position = self.currentPosition;
						
if(self.hasBox)
	{
	// zoom to crop box
	var cZoom = self.zoomFactor;	var nZoom = zoomFactor;
	var zRatio = nZoom / cZoom;		// dividing by two zooms, this maybe be bad (floating point errors)
	
	// size may be off ... 
	self.boxRatio = self.dragData.original.w / self.dragData.original.h;
//console.log(self.boxRatio);
		self.convertOriginalToScaled();  // self.zoomFactor ... 
		self.convertScaledToOriginal();	
	self.boxRatio = self.dragData.original.w / self.dragData.original.h;
//console.log(self.boxRatio);
	
	var padding = self.options.box.padding;
	var border = self.options.box.border;
	
	var ew = self.$edges.width();
		ew = zRatio * ew;
	var eh = self.$edges.height();
		eh = zRatio * eh;
	
		// changing the size of the crop box ...
		self.dragData.scaled.w = ew;
		self.dragData.scaled.h = eh;
		
		// distance from edges ...
		var dx = zRatio * (self.dragData.scaled.x1 + padding - self.placeX);
		var dy = zRatio * (self.dragData.scaled.y1 + padding - self.placeY);
//console.log(" dx: " + dx + " dy: " + dy);		
		
		// let's center the crop box in the new window		
		var cx = (self.containerWidth - ew)/2;
		var cy = (self.containerHeight - eh)/2;
				self.dragData.scaled.x1 = cx + border;
				self.dragData.scaled.y1 = cy + border;
			
			self.dragData.scaled.x2 = self.dragData.scaled.x1 + ew;		
			self.dragData.scaled.y2 = self.dragData.scaled.y1 + eh;
			
		var key="zoom-with-crop";
		
		// this updates dragScaled and drawCoords ... resizes and moves the box ... 
		self.boxPlace(self.dragData.scaled.y1,self.dragData.scaled.x1,self.dragData.scaled.w,self.dragData.scaled.h, key);
		
		// preserving what the crop box is highlighting,	
		var placeX = self.dragData.scaled.x1 - dx + padding*zRatio;
		var placeY = self.dragData.scaled.y1 - dy + padding*zRatio;
			position =  placeX + "px " + placeY+ "px";			
			self.currentPosition = position;
			self.currentPlace = position; // update
			self.placeX = placeX;
			self.placeY = placeY;
	}
						
						
					var obj = self.$elem.find(".cropMe-background-image"); // maybe faster to access directly
								obj.css({ 
										"background-size":  size,
										"background-position": position
										});												
					self.zoomFactor = zoomFactor;
					
					self.zoomHistory[key] = {zoom: zoomFactor, w: self.sizeX, h: self.sizeY, top: self.placeX, left: self.placeY, element: self.zoomElement, fit: self.currentFit, size: size, place: self.currentPlace, position: position };
					
//console.log(self.zoomHistory);
					
					self.updateConsole();
					//.cropVerify();
					
					}
			return self;
			},
								
			
						moveTo: function (x,y,units="scaled") {  // move x,y pixels based on units (original, scaled)
								var self = this;
						
//console.log("x: "+ x + " y: " + y + " units: "+ units);
//console.log("placeX: "+ self.placeX + " placeY: " + self.placeY + " units: "+ units);
								switch(units)
										{
										case "original":
											var nx = x / self.zoomFactor;
											var ny = y / self.zoomFactor;
											self.placeX = nx;
											self.placeY = ny;
											//self.placeX += nx;	// not delta
											//self.placeY += ny;
										break;
										case "scaled":
											self.placeX = x;	
											self.placeY = y;
											//self.placeX += x;	// not delta
											//self.placeY += y;
										break;
										}
//console.log("placeX: "+ self.placeX + " placeY: " + self.placeY + " units: "+ units);
								var position =  self.placeX + "px " + self.placeY+ "px";
									self.currentPosition = position;
									self.currentPlace = position;
									
								var obj = self.$elem.find(".cropMe-background-image");
										obj.css({ 
												"background-position": position
												});
												
									self.updateConsole(); //.cropVerify();
																				
								return self;
							},
						
		moveBoxDelta: function (dX,dY, units="scaled",both=true) {  
			var self = this;	
				self.dragScaledToDrawCoords();
				var position = calculateRectPos(self.drawCoords);
					var t = parseFloat(position.top    .split("px").join(""));
					var l = parseFloat(position.left   .split("px").join(""));
						t += dY;
						l += dX;
					position.top = t + "px";
					position.left = l + "px";	
				// update it ... 
				self.drawCoords = getDataFromPosition(position); 				
				self.drawCoordsToDragScaled();
					
					// Set position and size
					switch(both)
						{
						default:
							drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
							self.drawingRect.css(position);	
							self.$dragborder.css(position);	
						break;
						case "border":
						self.$dragborder.css(position);	
						break;
						case "box":
						drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
						self.drawingRect.css(position);	
						
						
						break;
						}
					
					self.updateConsole();
					// .cropVerify();
			return self;
			},
							
						moveDelta: function (dX,dY, units="scaled") {  // increment ... units are scaled [container]
								var self = this;
									if(dX == 0 && dY == 0) { return false; } // don't continue if nothing has changed ... 
									var t = Math.abs(dX) + Math.abs(dY); // total movement
								
//console.log("dX: "+ dX + " dY: " + dY + " t: " + t + " units: "+ units);
									//if(t < 9) { return false; } // requires at least 5 pixel movement ... 
								var scaledX = self.placeX;
								var scaledY = self.placeY;
//console.log("scaledX: "+ scaledX + " scaledY: " + scaledY + " units: "+ units);
//console.log("dX: "+ dX + " dY: " + dY + " units: "+ units);
									switch(units)
										{
										// happening in real units ... 
										case "original":
											scaledX += dX;	
											scaledY += dY;	
											/*
											var nx = dX / self.zoomFactor;
											var ny = dY / self.zoomFactor;
											scaledX += nx;
											scaledY += ny;
											*/
										break;
										case "scaled":
											//var nx = dX * self.zoomFactor * self.largeWidth;
											// happening with drag, so do I care?
											var nx = dX;
											var ny = dY;
											//var ny = dY * self.zoomFactor * self.largeHeight;
											scaledX += nx;
											scaledY += ny;
											/*										
											scaledX += dX;	
											scaledY += dY;
											*/											
										break;
										}
//console.log("scaledX: "+ scaledX + " scaledY: " + scaledY + " units: "+ units);
									self.moveTo(scaledX,scaledY,"scaled"); // scaling already occurred ... 
								return self;
							},
							
						bind: function(  ) {
								var self = this;	
										self.bindContainer();  	// background image
										self.bindBox();			// modal of box
																// actual cropbox ... special binding on complete ... unbinding on begin ...
										self.bindConsole();
									
									// http://stackoverflow.com/questions/3149362/capture-key-press-or-keydown-event-on-div-element
									// tabindex=0 on div, outline: none for focus ...
										
									
								
							return self;
							},
		
		startMovePoint: function ( e,d ) {
			var self = this; 
					self.movePointRatio = self.dragData.scaled.w / self.dragData.scaled.h;
				self.maintainAspectRatio = (e.shiftKey || e.ctrlKey || e.altKey);
//console.log(" self.maintainAspectRatio: " + self.maintainAspectRatio + " d: " + d);
				self.isResizingBox = true;
				self.hidePoints();
				self.movingPoint = {};
					// _x1 is the original and will be used at the end ... regardless of what "drag" did.
					self.movingPoint._x1 = self.movingPoint.x1 = e.pageX; // only the delta matters ...
					self.movingPoint._y1 = self.movingPoint.y1 = e.pageY; // only the delta matters ...
			
			return self;
			},
		dragMovePoint: function ( e,d ) {
//console.log("dragMovePoint");
//console.log(" e: " + e + " d: " + d);
			var self = this;
				if(self.isResizingBox)
					{
//console.log(e);
					self.movingPoint._x2 = self.movingPoint.x2 = e.pageX; // only the delta matters ...
					self.movingPoint._y2 = self.movingPoint.y2 = e.pageY; // only the delta matters ...
				
					
				var dx = self.movingPoint.x2 - self.movingPoint.x1;
				var dy = self.movingPoint.y2 - self.movingPoint.y1;
				
				var data = self.dragData.scaled;
				var key = d;
//console.log("says " + d);
//console.log(" dx: " + dx + " dy: " + dy);

				
					data = calcMovePoint(data,dx,dy,d,self);
					
					var doMove = self.boxPlace(data.y1,data.x1,data.w,data.h, key);
					if(!empty(doMove))
						{													
						self.movingPoint.x1 = self.movingPoint.x2;
						self.movingPoint.y1 = self.movingPoint.y2;	
						}	
					}
			return self;
			},
							
			
		stopMovePoint: function ( e,d ) {
//console.log("stopMovePoint");
//console.log(" e: " + e + " d: " + d);
			var self = this;
				self.isResizingBox = false;
				var dx = self.movingPoint._x2 - self.movingPoint._x1;
				var dy = self.movingPoint._y2 - self.movingPoint._y1;
				//self.$dragborder.hide();
			
			var data = self.dragData.scaled;
			var data = getDataFromForm(self.myID,"box");
				var key = d;
// http://stackoverflow.com/questions/1682495/jquery-resize-to-aspect-ratio
				data = calcMovePoint(data,dx,dy,d,self);						
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
			return self;
			},
			
		startMoveImage: function ( e ) {
//console.log("startMoveImage");
			var self = this;
				self.isMovingBackground = true;
				self.movingBackground = {};
					self.movingBackground.x1 = e.pageX; // only the delta matters ...
					self.movingBackground.y1 = e.pageY; // only the delta matters ...
			
			return self;
			},
		dragMoveImage: function ( e ) {
//console.log("dragMoveImage");
			var self = this;
				if(self.isMovingBackground) 
					{
					if(!isUndefined(self.movingBackground)) // timeout delay may trigger error ...
						{
//console.log(e);
						self.movingBackground.x2 = e.pageX; // only the delta matters ...
						self.movingBackground.y2 = e.pageY; // only the delta matters ...
										
						var dx = self.movingBackground.x2 - self.movingBackground.x1;
						var dy = self.movingBackground.y2 - self.movingBackground.y1;
						//self.moveTo(x,y);	
						var doMove = self.moveDelta(dx,dy,"scaled"); 
						if(!empty(doMove))
							{													
							self.movingBackground.x1 = self.movingBackground.x2;
							self.movingBackground.y1 = self.movingBackground.y2;	
							}	
						}
					}
			return self;
			},
							
							
		stopMoveImage: function ( e ) {
//console.log("stopMoveImage");
			var self = this;
				self.isMovingBackground = false;
					if(!isUndefined(self.movingBackground)) // timeout delay may trigger error ...
						{
						var dx = self.movingBackground.x2 - self.movingBackground.x1;
						var dy = self.movingBackground.y2 - self.movingBackground.y1;
								//self.moveTo(x,y);	
								self.moveDelta(dx,dy,"scaled");
						}
			
			return self;
			},
			
		startMoveBox: function ( e ) {
//console.log("startMoveBox");
			var self = this;
				self.isMovingBox = true;
				self.drawingRect.show();
				self.hidePoints();				
				self.movingBox = {};
					self.movingBox.x1 = e.pageX; // only the delta matters ...
					self.movingBox.y1 = e.pageY; // only the delta matters ...
			
			return self;
			},
		dragMoveBox: function ( e ) {
//console.log("dragMoveBox");
			var self = this;
				if(self.isMovingBox)
					{
//console.log(e);
					self.movingBox.x2 = e.pageX; // only the delta matters ...
					self.movingBox.y2 = e.pageY; // only the delta matters ...
									
				var dx = self.movingBox.x2 - self.movingBox.x1;
				var dy = self.movingBox.y2 - self.movingBox.y1;
					//self.moveTo(x,y);	
					var doMove = self.moveBoxDelta(dx,dy,"scaled","border"); 
					if(!empty(doMove))
						{													
						self.movingBox.x1 = self.movingBox.x2;
						self.movingBox.y1 = self.movingBox.y2;	
						}	
					}
			return self;
			},
							
							
		stopMoveBox: function ( e ) {
//console.log("stopMoveBox");
			var self = this;
				//self.$dragborder.show();
				self.isMovingBox = false;
				var dx = self.movingBox.x2 - self.movingBox.x1;
				var dy = self.movingBox.y2 - self.movingBox.y1;
								//self.moveTo(x,y);	
								self.moveBoxDelta(dx,dy,"scaled",true);
				self.drawingRect.hide();
			
			return self;
			},
							
						bindContainer: function ( ) {
							var self = this;
								
/******************* self.$elem [container] with transparent and background elements ********************************************** */							
								// EVENT_MOUSEOVER
								self.$elem.bind(EVENT_MOUSEOVER,function( ){
											self.isActive = true;
												// these bindings are permanent ... modal hides them ... 
												//self.determineBindings();
												self.unBindMe();
												self.bindImage();
											return false;
											});	
								// EVENT_MOUSEOUT
								self.$elem.bind(EVENT_MOUSEOUT,function( ){
											self.isActive = false;
												self.unBindMe();
											return false;
											});	
								// EVENT_MOUSE_DOWN
									// we will let them crop anywhere outside the box, but the final rectangle will be only to the edges of the image ... 
								self.$elem.bind(EVENT_MOUSE_DOWN,function( e ){
//console.log("mouse-down");
//console.log(e);
											self.startMoveImage(e);
											return false;
											});	
										
								// EVENT_MOUSE_MOVE
								self.$elem.bind(EVENT_MOUSE_MOVE,function( e ){
											self.dragMoveImage(e);
											return false;
											});	
 
								// EVENT_MOUSE_UP 
								self.$elem.bind(EVENT_MOUSE_UP,function( e ){
//console.log("mouse-up");
//console.log(e);
											self.stopMoveImage(e);
											return false;
											});	
							
							return self;
							},
		
		determineBindings: function ( ) {
			var self = this;		
							
				self.unBindMe();
												
				var mySwitch = computeSwitch(self.boxAction);
				switch(mySwitch)
					{
					case "crop":
						self.bindCrop();
					break;
					case "move-image":
					case "move-box":					
					case "move-point":
						self.bindNotCrop();
						self.bindNotCrop();
						// also bind arrows ... 
						
						// click drag ... maintain aspect ratio ...
						// cntrl-arrow, shift-arrow, and alt-arrow moves different units...
						//http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
					break;
					}													
													
			return self;
			},
			
		doMessage: function ( message , append = false ) {
			var self = this;
				if(self.options.console.showControls)
					{
					var msgInfo = $("#"+self.myID+"-message");
					var cmessage = msgInfo.html();
					if(append) { message = cmessage + message; }
						msgInfo.html(message); 
						msgInfo.show(); 
						
					if(self.options.enable.consoleLog)
						{
						if(cmessage != message)  // no replicates ... 
							{
							console.log(message);
							}						
						}
					}

				
			return self;
			},
							
		bindBox: function ( ) {
			var self = this;
				
				// EVENT_MOUSEOVER
				self.$box.bind(EVENT_MOUSEOVER,function( ){
							self.isActiveBox = true;
								self.determineBindings();
							return false;
							});	
				// EVENT_MOUSEOUT
				self.$box.bind(EVENT_MOUSEOUT,function( ){
							self.isActiveBox = false;
								self.unBindMe();
							return false;
							});	
				
				// EVENT_MOUSE_DOWN	
				self.$box.bind(EVENT_MOUSE_DOWN,function( e ){
//console.log(e);
							self.whatIsDragging = self.boxAction;
							var mySwitch = computeSwitch(self.boxAction);
//console.log("EVENT_MOUSE_DOWN mySwitch: " + mySwitch);
							var message = "";
							switch(mySwitch)
								{
								case "crop":
									self.startCrop(e);
									message = "[crop] starting ... ";
								break;
								case "move-image":
									self.startMoveImage(e);	
									message = "[move-image] starting ... ";						
								break;
								case "move-box":
									self.startMoveBox(e);
									message = "[move-box] starting ... ";
								break;
								case "move-point":
									var d = computeDirection(self.boxAction);
									self.startMovePoint(e,d);
									message = "[move-point] ["+d+"] starting ... ";
									if(self.maintainAspectRatio || self.forceAspectRatio)
										{
										message += " ASPECT RATIO LOCKED";
										}
								break;
								}
self.doMessage(message);
						
//$("#mycoords").text(self.boxAction + "  X: " + e.pageX + ", Y: " + e.pageY); 
							return false;
							});
							
				// mouse move will track things ...
				// EVENT_MOUSE_MOVE
				self.$box.bind(EVENT_MOUSE_MOVE,function( e ){
//console.log(e);
							var mySwitch = computeSwitch(self.whatIsDragging);
//console.log("EVENT_MOUSE_MOVE mySwitch: " + mySwitch);
							var message = "";
							switch(mySwitch)
								{
								default:  // nothing is dragging ...
											// let's not calculate if dragging ...
												// inside the box
												// at a point
												// outside the box 
											self.calculateBoxAction(e); 
										
									var s = computeSwitch(self.boxAction);
									var d = computeDirection(self.boxAction);
									
									var message = "["+s+"]";
										if(!empty(d)) { message +=  " ["+d+"]";}
									self.doMessage(message);
												// bind events (arrows)
												// unbind events so when out, nothing
			
											self.determineBindings();
						
							
								break;
								
								
								case "crop":
									self.dragCrop(e);
									message = "[crop] dragging ... ";
//$("#mycoords").text("dragCrop X: " + e.pageX + ", Y: " + e.pageY);
								break;
								case "move-image":
									self.dragMoveImage(e);
									message = "[move-image] dragging ... ";
//$("#mycoords").text("dragMoveImage X: " + e.pageX + ", Y: " + e.pageY);
								break;
								case "move-box":
									self.dragMoveBox(e);
									message = "[move-box] dragging ... ";
//$("#mycoords").text("dragMoveBox X: " + e.pageX + ", Y: " + e.pageY);
								break;
								case "move-point":
									var d = computeDirection(self.whatIsDragging);
									self.dragMovePoint(e,d);
									message = "[move-point] ["+d+"] dragging ... ";
									if(self.maintainAspectRatio || self.forceAspectRatio)
										{
										message += " ASPECT RATIO LOCKED";
										}
								break;
								}
							
self.doMessage(message);
						return false;
							});		
							
				
			// we will use status values of true and false to understand if I am drawing a crop box or if I am just moving one ... or if I am moving a line (e, nw, etc.)
			// EVENT_MOUSE_UP 					
				self.$box.bind(EVENT_MOUSE_UP,function( e ){
//console.log(e);
							var mySwitch = computeSwitch(self.boxAction);
//console.log("EVENT_MOUSE_UP mySwitch: " + mySwitch);
							var message = "";
								switch(mySwitch)
									{
									case "crop":
										self.stopCrop(e);
										message = "[crop] complete! ";										
									break;
									case "move-image":
										self.stopMoveImage(e);
										self.cropVerify(); 
										message = "[move-image] complete! ";
									break;
									case "move-box":
										self.stopMoveBox(e);
										self.cropVerify(); 
										message = "[move-box] complete! ";
									break;
									case "move-point":
										var d = computeDirection(self.boxAction);
										self.stopMovePoint(e,d);
										self.cropVerify();
										message = "[move-point] ["+d+"] complete! ";
									break;
									}
self.doMessage(message);								
								
							return false;
							});	
							
							
				
			// EVENT_DBLCLICK	... EVENT_CLICK
				// http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
				
					
			// EVENT_MOUSE_DOWN	comes before EVENT_CLICK
				// http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
				//
				//  .on vs .bind ... so you can turn it off with "unbind"
				
						
			return self;
			},
		
		startCrop: function ( e ) {
			var self = this;
				self.isDrawingBox = true;
				self.dragData = resetObject("dragData");
				
//console.log("reset");
//console.log(self.dragData);

				self.drawCoords = {x1:0, y1:0, x2:0, y2:0};
					// coordinates on page ... 
					var ex = e.pageX;  // no scrolling offset ... [REALLY?]
					var ey = e.pageY;
					// coordinates in container ... 
					var nx = ex - self.containerOffsetLeft;
					var ny = ey - self.containerOffsetTop;
//console.log("startCrop");
//console.log(" ex: " + ex + " ey: " + ey );
//console.log(" nx: " + nx + " ny: " + ny );
				self.dragData.scaled.x1 = nx;
				self.dragData.scaled.y1 = ny;
						self.drawCoords.x1 = nx + self.options.box.padding;  // ex is nice, but absolute is within a relative container
						self.drawCoords.y1 = ny + self.options.box.padding;
				// destroy any previous rectangles
				$(".cropMe-drawing-rectangle").remove();
				
				self.hasBox			= false;
				self.initBox();	
				self.togglePoints("off");	
				// Create the rectangle
					self.drawingRect = createRect(self.drawCoords);	
					self.drawingRect.appendTo(self.$box);
					
			return self;
			},
						
		
						
		dragCrop: function ( e ) {
			var self = this;
				// if(self.isDrawingBox)  // this happens in the bind ... why??
//console.log(e);
				if(self.isDrawingBox)
				{	
				if(validNumber(e.pageX))
					{
					// coordinates on page ... 
					var ex = e.pageX;
					var ey = e.pageY;
					// coordinates in container ... 
					var nx = ex - self.containerOffsetLeft;
					var ny = ey - self.containerOffsetTop;
//console.log("dragCrop");
//console.log(" ex: " + ex + " ey: " + ey );
//console.log(" nx: " + nx + " ny: " + ny );	
					// just store the data, reversed will happen at the end for dragData ...
					self.dragData.scaled.x2 = nx;
					self.dragData.scaled.y2 = ny;
							self.drawCoords.x2 = nx + self.options.box.padding;  // ex is nice, but absolute is within a relative container
							self.drawCoords.y2 = ny + self.options.box.padding;
					var w = (self.drawCoords.x2 - self.drawCoords.x1);
					var h = (self.drawCoords.y2 - self.drawCoords.y1);
							self.dragData.scaled.w = self.drawCoords.w = w;
							self.dragData.scaled.h = self.drawCoords.h = h;
					var position = calculateRectPos(self.drawCoords);
					drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
					// Set position and size
					self.drawingRect.css(position);
					}
				}
			return self;
			},
						
		
		
		
		unBindMe: function (  ) {
			var self = this;	
				// unbind anything already bound ... 
				$(window).unbind(EVENT_WHEEL);
				$(window).unbind(EVENT_KEYDOWN);
				
			return self;
			},
		// crop disabled, only image (movable/zoomable)
		bindImage: function ( ) {
			var self = this;	
				$(window).bind(EVENT_WHEEL,function(event){
							self.bindWheelZoom(event);
						return false;
						});	
				
											
			return self;
			},
			
		// in crop mode
		bindCrop: function ( ) {
			var self = this;	
				$(window).bind(EVENT_WHEEL,function(event){
							self.bindWheelZoom(event);
						return false;
						});	
						
											
			return self;
			},
		
			
			
		// crop mode, but we have a crop box with controls ...
		bindNotCrop: function ( ) {
			var self = this;	
			$(window).bind(EVENT_WHEEL,function(event){
							self.bindWheelZoom(event);
						return false;
						});	
						
						
				$(window).bind(EVENT_KEYDOWN,function(e){							
							self.bindArrowMove(e);
						//return false;
						});	
						
				$(window).bind(EVENT_KEYDOWN,function(e){	
							var key = e.which || e.keyCode || 0;
//console.log(key);
							if(key == 27)
								{
								// ... esc is prevented
								e.preventDefault();
								self.togglePoints("off");	// also resets to "crop"
								//self.togglePoints();
								}
						});												
			return self;
			},
		
			
		stopCrop: function ( e ) {
			var self = this;	
				if(self.isDrawingBox)
					{ 			
				self.isDrawingBox = false;
				self.whatIsDragging = "nothing";
				// let's get the last position, if it exists ...
				if(validNumber(e.pageX))
					{
					// coordinates on page ... 
					var ex = e.pageX;
					var ey = e.pageY;
					// coordinates in container ... 
					var nx = ex - self.containerOffsetLeft;
					var ny = ey - self.containerOffsetTop;
//console.log("dragCrop");
//console.log(" ex: " + ex + " ey: " + ey );
//console.log(" nx: " + nx + " ny: " + ny );	
					// just store the data, reversed will happen at the end for dragData ...
					self.dragData.scaled.x2 = nx;
					self.dragData.scaled.y2 = ny;
							self.drawCoords.x2 = nx + self.options.box.padding;  // ex is nice, but absolute is within a relative container
							self.drawCoords.y2 = ny + self.options.box.padding;
					var w = (self.drawCoords.x2 - self.drawCoords.x1);
					var h = (self.drawCoords.y2 - self.drawCoords.y1);
							self.dragData.scaled.w = self.drawCoords.w = w;
							self.dragData.scaled.h = self.drawCoords.h = h;
					
					
					}
					var position = calculateRectPos(self.drawCoords);
					drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
					// Set position and size
					self.drawingRect.css(position);
					
				// we have self.dragData.scaled and self.drawCoords
				var tempData = self.dragData.scaled;
							var when = "" + getMilliseconds() + "-pre-inbounds";
							var memory = {actual: tempData, adjusted: self.dragData, time: when, image: {zoom: self.zoomFactor, w: self.sizeX, h: self.sizeY, top: self.placeX, left: self.placeY, element: self.zoomElement, fit: self.currentFit, place: self.currentPlace} };
							self.dragDataBackup[when] = memory;
					self.dragData.scaled = checkReversed(self.dragData.scaled);
					self.convertScaledToOriginal();
					self.isInBounds();  // self.dragData.original [original] compared, updated, as well as self.dragData.scaled
				if(self.inBounds == false)
					{
console.log("REALLY BAD!")
// canvas to draw http://jsbin.com/EdaCIrI/1/edit?html,js,output
// http://jsfiddle.net/4Kdhz/1/
					self.resetBox();
					}
					else
						{
							var when = "" + getMilliseconds() + "-post-inbounds";
							var memory = {actual: tempData, adjusted: self.dragData, time: when, image: {zoom: self.zoomFactor, w: self.sizeX, h: self.sizeY, top: self.placeX, left: self.placeY, element: self.zoomElement, fit: self.currentFit, place: self.currentPlace} };
							self.dragDataBackup[when] = memory;						
							
						self.hasBox	= true; // if true, our image movements and zoom need to account for this ...
						self.isBoxVisible	= true; // is the crop box visible [todo]
						self.isBoxActive	= true; // does a crop box exist [for new bindings]
							// hide (remove?) this rectangle
							$(".cropMe-drawing-rectangle").hide();
							// update true cropbox element...							
							self.$crop.show();
								self.$crop.css({"border-width": self.options.box.border});
							self.$edges.show();
								self.$edges.css({"border-width": self.options.box.border});
								
						if(!empty(self.drawCoords.extra.position)) 
							{ 
							position = self.drawCoords.extra.position;
							}
									
						var cposition = getCropPosition(position,self);
							self.$crop.css(cposition);
							self.$edges.css(cposition);							
							
						
						//let caller know image has been loaded
						//self.options.methods.onCropFinish(self.$elem);
						
						
						
						self.updateConsole();
						
						// let's place self.$edges ... 8 points ...
						self.buildPoints();							
						self.togglePoints("on");
						self.$dragborder.show();
										
						//self.bindCropBox();
						self.cropPreview();
						
						self.options.methods.onCropFinish(self);
//console.log(self.dragDataBackup);
						}
					}
			return self;
			},
				
		calculateBoxAction: function(e) {
			var self = this;	
				self.boxAction = "crop"; 
				self.$box.css({"cursor": "default"});
			if(self.toggleBoxControls == "none") 
				{
				return self;
				}
			//var data = (self.drawCoords);	
			var data = (self.dragData.scaled);	
				// self.boxAction = "move-image";  // [crop] move-image, move-box, move-point
			var ex = e.pageX; var ey = e.pageY;
			var x = ex - self.containerOffsetLeft; var y = ey - self.containerOffsetTop;
//$("#mycoords").text(self.boxAction + " -> mouseMove X: " + x + ", Y: " + y); 
			if(!empty(data)) 
				{
				if(self.isBoxVisible)
					{
				// first determine in ... move-box
				if(x <= data.x2 && x >= data.x1 && y <= data.y2 && y >= data.y1)
					{
					self.boxAction = "move-box"; 
					self.$box.css({"cursor": "move"});
					
//$("#mycrop").text(self.boxAction + " -> mouseMove X: " + x + ", Y: " + y); 
					return self;
					}
					else
						{
						
						// then determine for out, if a point or not ...
						for(i=0;i<self.myPoints.direction.length;i++)
							{
							var d 	= self.myPoints.direction[i];
//console.log(self.myPoints.direction);	
							var sub = self.myPoints.sub[d];
							if(x <= (sub.xmax) && x >= sub.xmin && y <= sub.ymax && y >= sub.ymin)
								{
								self.boxAction = "move-point" + "|" + d; 
//console.log(d+"-resize");
								self.$box.css({"cursor": d+"-resize"});
								//self.$box.css({"cursor": "move"});
								//break;
//$("#mycrop").text(self.boxAction + " -> mouseMove X: " + x + ", Y: " + y); 
								return self;
								}							
							}
						// point not found
						self.boxAction = "move-image"; 
						//self.$box.css({"cursor": "move", "cursor": "grab", "cursor": "-moz-grab", "cursor": "-webkit-grab"});
						self.$box.css({"cursor": "pointer"});
//$("#mycrop").text(self.boxAction + " -> mouseMove X: " + x + ", Y: " + y); 
								return self;					
//console.log("calculateBoxAction");
//console.log(" x: " + x + " y: " + y);
						}
					}
				}
					
			return self;
			},
		
		
		buildPoints: function() {
			var self = this;
//console.log("buildPoints->monte");
//console.log(_myPoints);
//console.log(self.myPoints);
				self.myPoints = resetObject("myPoints");  // reset ... 
				/*
				// should reset, but is not, so
					_myPoints.direction.length = 0;
					_myPoints.xmin.length = 0;
					_myPoints.xmax.length = 0;
					_myPoints.ymin.length = 0;
					_myPoints.ymax.length = 0;
//console.log(_myPoints);
				self.myPoints = _myPoints;
				*/
//console.log("reset");
//console.log(self.myPoints);
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-nw");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("nw",obj,"top","left"); 
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-sw");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("sw",obj,"bottom","left");
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-ne");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("ne",obj,"top","right");
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-se");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("se",obj,"bottom","right");
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-n");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("n",obj,"top","center");
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-s");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("s",obj,"bottom","center");
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-e");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("e",obj,"middle","right");
					
				var obj = $("#"+self.myID+" SPAN.cropMe-point.point-w");
					obj.css({"position": "absolute", "z-index": self.zIndexEdges});
					obj.width(self.options.box.corner);
					obj.height(self.options.box.corner);
					obj.show();
					self.placePoint("w",obj,"middle","left");
					
				
				self.$dragborder.css({"position": "absolute", "z-index": self.zIndexEdges + 1, "left": self.myPoints.data.x1, "top": self.myPoints.data.y1});
					self.$dragborder.width(self.myPoints.data.w);
					self.$dragborder.height(self.myPoints.data.h);	
					self.$dragborder.show();
					
			return self;
			},
			
		placePoint: function(direction,obj,vertical,horizontal) {
			var self = this;
				// placePoint("ne",obj,"middle","left")
				var border = self.options.box.border; // border of crop-box
				var corner = self.options.box.corner; // size of point (square)
				
				var padding = self.options.box.padding;
				var tolerance = self.options.box.tolerance; // size of point (square)
				//var data = getCropBoxCoords(self); 
				var data = checkReversed(self.drawCoords); // has offset built in ...
					self.myPoints.data = data;		
				var l 	= 0;
				var t 	= 0;
					switch(vertical)
						{
						default: // top ... 
							t = data.y1 - corner;
						break;
						case "middle":
						case "center":
							t = (data.y1 + data.y2)/2 - corner/2;
						break;
						
						case "bottom":
							t = data.y2;
						break;
						}
					switch(horizontal)
						{
						default: // left ... 
							l = data.x1 - corner;
						break;
						
						case "middle":
						case "center":
							l = (data.x1 + data.x2)/2 - corner/2;
						break;
						
						case "right":
							l = data.x2;
						break;
						}
						
				// center				// deviations
				var cx = l + corner/2;  var dx = corner/2 + 2*tolerance;
					// min					// max
					var xmin = cx - dx - padding; var xmax = cx + dx - padding;
				var cy = t + corner/2;	var dy = corner/2 + 2*tolerance;
					var ymin = cy - dy - padding; var ymax = cy + dy - padding;
					
				self.myPoints.sub[direction] = {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax};
						
					self.myPoints.xmin.push(xmin);
					self.myPoints.xmax.push(xmax);
					self.myPoints.ymin.push(ymin);
					self.myPoints.ymax.push(ymax);
					
					self.myPoints.direction.push(direction);
					var position = {};							
									position.left 	= l + "px";
									position.top 	= t + "px";
						obj.css(position);
			return self;
			},
		
		
		toggleRatio: function(force=false) {
			var self = this;
				var state = self.forceAspectRatio;
				var toggle = $("#"+self.myID+"-box-toggle-ratio");
					var t = toggle.find($(".fa"));
					
				if(state) // aspect ratio is on, let's turn it off
					{
					t.removeClass("fa-lock").addClass("fa-unlock");
					self.forceAspectRatio = false;
					}
					else 
						{
						t.removeClass("fa-unlock").addClass("fa-lock");
						self.forceAspectRatio = true;
						}		
			return self;
			},	
		togglePoints: function(force=false) {
			var self = this;
				var toggle = $("#"+self.myID+"-box-toggle-controls");
					var t = toggle.find($(".fa"));
//console.log(t);
					var toToggle = false;
			
					if(self.hasModal)
						{
						if(self.isBoxVisible)
							{
							toToggle = true;
							}									
						}
//console.log("togglePoints-> " + toToggle);	
				if(!force)
					{
					if(toToggle)
						{
						if (self.$edges.is(":visible")) 
							{
							//t.removeClass("fa-toggle-on").addClass("fa-toggle-off");
							
							t.removeClass("normal").addClass("fa-flip-horizontal");
							
							
							
							t.css({"color": "grey"});								
							self.hidePoints();
							self.toggleBoxControls = "none";
							}
							else
								{
								//t.removeClass("fa-toggle-off").addClass("fa-toggle-on");
								t.removeClass("fa-flip-horizontal").addClass("normal");
								
								t.css({"color": "green"});
								self.showPoints();
								self.toggleBoxControls = "edges";							
								}
						}
					}
					else
						{
						switch(force)
							{
							default:
							case "on":
								t.removeClass("fa-flip-horizontal").addClass("normal");
								t.css({"color": "green"});
								self.showPoints();
								self.toggleBoxControls = "edges";							
							break;
							
							case "off":
								t.removeClass("normal").addClass("fa-flip-horizontal");
								t.css({"color": "grey"});								
								self.hidePoints();
								self.toggleBoxControls = "none";
							break;
							}
						}			
			return self;
			},	
			
					
						
						
		showPoints: function() {
			var self = this;
				self.$edges.show();
					$("#"+self.myID+" SPAN.cropMe-point.point-ne").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-nw").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-se").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-sw").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-e").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-n").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-w").show();
					$("#"+self.myID+" SPAN.cropMe-point.point-s").show();
				//self.$dragborder.show();
			return self;
			},
		hidePoints: function() {
			var self = this;
				self.$edges.hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-ne").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-nw").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-se").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-sw").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-e").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-n").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-w").hide();
					$("#"+self.myID+" SPAN.cropMe-point.point-s").hide();
				//self.$dragborder.hide();
			return self;
			},
			
		initBox: function() {
			var self = this;
				// set modal to transparent 
				self.cssFunctions("#"+self.myID,"box-transparent",false);
				self.$pseudo.show();
				self.$crop.hide();	
				
			return self;
			},
			
				
				
		resetBox: function() {
			var self = this;
				// the box was so far out of bounds it shouldn't exist...
				self.$pseudo.hide();
				// move the size back to 0
				self.cssFunctions("#"+self.myID+" DIV.cropMe-pseudo-modal","box-pseudo",false);
				self.$crop.hide();
				self.$edges.hide();
				self.$dragborder.hide();
				self.hidePoints();
				self.cssFunctions("#"+self.myID,"box-white",false); // put the main modal back...
				$(".cropMe-drawing-rectangle").hide();
			return self;
			},
			
					
						
		isInBounds: function() {
			var self = this;
				self.inBounds = false;
				var bad = 0; 
				// cropped completely out of bounds, nothing to snap back to ...
				if(self.dragData.original.x1 < 0)
					{
					if(self.dragData.original.x2 < 0) { bad++; }
					}
				if(self.dragData.original.x2 > self.largeWidth)
					{
					if(self.dragData.original.x1 > self.largeWidth)  { bad++; }
					}
				if(self.dragData.original.y1 < 0)
					{
					if(self.dragData.original.y2 < 0) { bad++; }
					}
				if(self.dragData.original.y2 > self.largeHeight)
					{
					if(self.dragData.original.y1 > self.largeHeight)  { bad++; }
					}
//console.log("bad: " + bad);
				if(bad < 1 )
					{
					var changes = 0;
					self.inBounds = true;
					if(self.dragData.original.x1 < 0) 
						{ 
						self.dragData.original.x1 = 0;  changes++;
						}
					if(self.dragData.original.y1 < 0) 
						{ 
						self.dragData.original.y1 = 0;  changes++;
						}
					if(self.dragData.original.x2 > self.largeWidth) 
						{ 
						self.dragData.original.x2 = self.largeWidth;  changes++;
						}
					if(self.dragData.original.y2 > self.largeHeight) 
						{
						self.dragData.original.y2 = self.largeHeight;  changes++;
						}
					// checkReversed already called, but to be safe, Math.abs
					self.dragData.original.w	= Math.abs(self.dragData.original.x2-self.dragData.original.x1);
					self.dragData.original.h 	= Math.abs(self.dragData.original.y2-self.dragData.original.y1);
						self.dragData.original 	= checkReversed(self.dragData.original);
					// update to scaled ... 
					self.convertOriginalToScaled(); 
					
					self.drawCoords.extra = {};
					if(changes > 0 )
						{						
						self.dragScaledToDrawCoords();
						
						var position = calculateRectPos(self.drawCoords);
						drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
						// Set position and size
						self.drawingRect.css(position);
						self.drawCoords.extra = {changes: changes, position: position};
						}
					}
			return self;
			},
			
			dragScaledToDrawCoords: function () {
							var self = this;
								self.drawCoords.x1 = self.dragData.scaled.x1 + self.options.box.padding;
								self.drawCoords.x2 = self.dragData.scaled.x2 + self.options.box.padding;
								self.drawCoords.y1 = self.dragData.scaled.y1 + self.options.box.padding;
								self.drawCoords.y2 = self.dragData.scaled.y2 + self.options.box.padding;
								
								self.drawCoords.w = (self.drawCoords.x2 - self.drawCoords.x1);
								self.drawCoords.h = (self.drawCoords.y2 - self.drawCoords.y1);
							return self;
							},
		drawCoordsToDragScaled: function () {
							var self = this;
								self.dragData.scaled.x1 = self.drawCoords.x1 - self.options.box.padding;
								self.dragData.scaled.x2 = self.drawCoords.x2 - self.options.box.padding;
								self.dragData.scaled.y1 = self.drawCoords.y1 - self.options.box.padding;
								self.dragData.scaled.y2 = self.drawCoords.y2 - self.options.box.padding;
								
								self.dragData.scaled.w = (self.dragData.scaled.x2 - self.dragData.scaled.x1);
								self.dragData.scaled.h = (self.dragData.scaled.y2 - self.dragData.scaled.y1);
							return self;
							},
							
		cropPreview: function () {
			var self = this;
				if(empty(self.previewInfo))
					{
					// build once ...
					self.previewInfo = {preview: self.myID, elements: []};
					// #preview,^preview-opener.html
					var pA = self.$elem.data("preview").split(",");
					for(i=0;i<pA.length;i++)
						{
						var k = pA[i];
						var m = k.charAt(0);  	// method
						var v = k.substring(1);	// value
						switch(m)
							{
							default: // selector in page
								var selector = k;
								var obj = $(selector);
									obj.append( $(PREVIEW) );
								var find = selector + " DIV.cropMe-preview";
								var fobj = $(find);
									self.previewInfo.elements[i] = {"method": m, "selector":k, "obj": obj, "value": v, "find": find, "fobj": fobj};
							break;
							case "^": // new window
								self.previewInfo.elements[i] = {"method": m, "url": v, "target": self.myID + md5(v)};
							break;
							}
//console.log(" k: " + k + " m: " + m + " v: " + v );
						}					
					}
					
					
					
							var data = self.dragData.original;
								data.iw = self.largeWidth;
								data.ih = self.largeHeight;
								data.image = self.imageSrc;
								data.id = self.myID;
								// weird right-hand assignment ... let's make it official
								self.dragData.original = data;
								
					// let's loop through and do the preview ...
					$.each(self.previewInfo.elements, function(i,value){
						var m = value.method;
							
						switch(m)
							{
							default: // selector in page
								value.fobj.css({
												"background-image": "url("+data.image+")",
												"background-position": (-1*data.x1)+"px " + (-1*data.y1)+"px",
												"background-size": (data.iw)+"px " + (data.ih)+"px",
												"width": (data.w)+"px",
												"height": (data.h)+"px"
												});
							break;
							case "^": // new window
								var url = value.url + "?";								
								var style = self.options.preview.windowOpenStyle;
									$.each(data, function(k,v){ url += encodeURI(k) + "=" + encodeURI(v) + "&";});
									$.each(style, function(k,v){ url += encodeURI(k) + "=" + encodeURI(v) + "&";});
								
								window.open(url,value.target,self.options.preview.windowOpenParams);
								
								if(self.options.preview.windowFocus)
									{
									window.focus();
									}
							break;
							}
					});
					
//console.log(self.previewInfo);
			return self;
			},
			
		getVariable: function(key) {
				var self = this;
				var myReturn = null;
				eval("var myReturn = self."+key+";");
			return myReturn;
			},
		setVariable: function(key,value) { // can be string or object/array ... what about function?
				var self = this;
					myValue = (isString(value)) ? "'" + value.split("'").join("\'") + "'" : value;
				eval("self."+key+" = "+myValue+";");
			return self;
			},
			
		getCropData: function(which="original") {
				var self = this;
				var data = self.dragData.original;
				if(which != "original") { data = self.dragData.scaled; }
					data.zoom = self.zoomFactor;
			return data;
			},
			
		smartZoom: function (data) {
			var self = this;
				// data in original units, I know the container dimensions, let's figure out an initial zoom ... 
				var ratio = data.w / data.h;				
				var n = (ratio > 1) ? self.containerWidth : self.containerHeight;
				var d = (ratio > 1) ? data.w : data.h;
				var z = n/d - self.options.console.zoom; // a bit of space ... 
				//var z = n/d;
				
					self.zoomTo(z);
					self.updateConsole();
								
console.log("smartZoom");
//console.log(self);
			return self;
			},
			
		setCropData: function(data) {
				var self = this;
				data = checkReversed(data);					
				if(data.zoom)
					{
					self.zoomTo(data.zoom);
					}
					else
						{
						self.smartZoom(data);
						}
				self.dragData.original = data;
				self.convertOriginalToScaled();
				var _data = self.dragData.scaled;
				
				
				// crop ... 			
					self.crop(_data.x1, _data.y1, _data.x2, _data.y2);
				// imagePlace
					self.zoomTo(self.zoomFactor); // hasBox
					self.updateConsole();
					self.cropVerify();
				
			return self;
			},
		updateConsole: function () {  // increment zoom of background element
			var self = this;
						self.$elem.data("zoom", self.zoomFactor);
						self.$elem.data("crop-x1", self.dragData.original.x1);
						self.$elem.data("crop-y1", self.dragData.original.y1);
						self.$elem.data("crop-w", self.dragData.original.w);
						self.$elem.data("crop-h", self.dragData.original.h);
				if(self.options.console.showControls)
					{
					// zoomTo [image info]
					$("#"+self.myID+"-image-left").val( roundMe(self.placeX) );
					$("#"+self.myID+"-image-top").val( roundMe(self.placeY) );
					
					$("#"+self.myID+"-image-width").val( roundMe(self.sizeX) );
					$("#"+self.myID+"-image-height").val( roundMe(self.sizeY) );
					
					$("#"+self.myID+"-image-zoom").val( roundMe( 100 * self.zoomFactor) );
					
					// [crop info]						
					$("#"+self.myID+"-box-w").val( roundMe(self.dragData.scaled.w) );
					$("#"+self.myID+"-box-h").val( roundMe(self.dragData.scaled.h) );
					
					$("#"+self.myID+"-box-x1").val( roundMe(self.dragData.scaled.x1) );
					$("#"+self.myID+"-box-y1").val( roundMe(self.dragData.scaled.y1) );
					
					$("#"+self.myID+"-box-x2").val( roundMe(self.dragData.scaled.x2) );
					$("#"+self.myID+"-box-y2").val( roundMe(self.dragData.scaled.y2) );
					
					
					$("#"+self.myID+"-image-w").val( roundMe(self.dragData.original.w) );
					$("#"+self.myID+"-image-h").val( roundMe(self.dragData.original.h) );
					
					$("#"+self.myID+"-image-x1").val( roundMe(self.dragData.original.x1) );
					$("#"+self.myID+"-image-y1").val( roundMe(self.dragData.original.y1) );
					
					$("#"+self.myID+"-image-x2").val( roundMe(self.dragData.original.x2) );
					$("#"+self.myID+"-image-y2").val( roundMe(self.dragData.original.y2) );
					}				
			return self;
			},
		bindConsole: function ( ) {
			var self = this;
				
			// self.$controls = $("#"+self.myID+"-controls-interface");	
				if(self.options.console.showControls)
					{
					var imgInfo = $("#"+self.myID+"-image-info-row");
					var boxInfo = $("#"+self.myID+"-box-info-row");	
					var boxInfo2 = $("#"+self.myID+"-box-info-row2");	
					var msgInfo = $("#"+self.myID+"-message");
					
			var action = $("#"+self.myID+"-image-info");
				 action.click(function(){
					$("#"+self.myID+"-image-info-row").slideToggle('slow', function() {
						self.$controls.css({"max-height": computeToggleHeight(self) + "px"});
						});											 
					});
							 
			var action = $("#"+self.myID+"-box-info");
				 action.click(function(){
					$("#"+self.myID+"-box-info-row").slideToggle('slow', function() {
						self.$controls.css({"max-height": computeToggleHeight(self) + "px"});
						});
					$("#"+self.myID+"-box-info-row2").slideToggle('slow', function() {
						self.$controls.css({"max-height": computeToggleHeight(self) + "px"});
						});							
					});
							 
			var action = $("#"+self.myID+"-box-status");
				 action.click(function(){
					eval("var dfe = document."+self.myID+"myForm."+self.myID+"boxStatus;");
//console.log("dfe: "+dfe);
					var r = getCheckedValue(dfe);
					var obj = $("#"+self.myID+".cropMe-cropping");
					if(r == "on")
						{
						obj.fadeIn(self.options.timeout.showHideCropBox);
							self.hasModal = true;
						if(self.hasBox) { self.isBoxVisible = true; }
						}
						else
							{
							obj.fadeOut(self.options.timeout.showHideCropBox);
								self.hasModal = false;
							if(self.hasBox) { self.isBoxVisible = false; }
							}
//console.log("r:" + r);
					});
					
/***********************************  Image ZOOM *************/								 
			var action = $("#"+self.myID+"-image-zoom-in");
				 action.click(function(e){
					//e.preventDefault();
					var zoomIncrement = computeZoomIncrement(self, e);	
						var zoomFactor = self.zoomFactor + zoomIncrement;	
					var key = "console-click-zoom-in";
					self.zoomTo(zoomFactor, key);  // this also sets self.zoomFactor
					self.updateConsole();
					self.cropVerify();
					});
							 
			var action = $("#"+self.myID+"-image-zoom-out");
				 action.click(function(e){
					//e.preventDefault();
					var zoomIncrement = computeZoomIncrement(self, e);
						var zoomFactor = self.zoomFactor - zoomIncrement;	
					var key = "console-click-zoom-out"
					self.zoomTo(zoomFactor, key);  // this also sets self.zoomFactor
					self.updateConsole();
					self.cropVerify(); 
					});
							 
			var action = $("#"+self.myID+"-image-zoom");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if( triggerComplete (e) )
						{
						var nZoom = $(this).val();
						if(validNumber(nZoom))
							{					
							var zoomFactor = nZoom / 100;							
							var key = "console-text-zoom";
							self.zoomTo(zoomFactor, key);  // this also sets self.zoomFactor
							self.updateConsole();
							self.cropVerify();
							}
						}
					// return false;
					});	
/***********************************  Image MOVEMENTS *************/						
			var action = $("#"+self.myID+"-image-top");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if( triggerComplete (e) )
						{
						var data = getImagePositionFromForm(self.myID);
							var key = "console-text-image-top";
						self.imagePlace(data.t,data.l, data.w,data.h, key);
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-left");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if( triggerComplete (e) )
						{
						var data = getImagePositionFromForm(self.myID);
							var key = "console-text-image-left";
						self.imagePlace(data.t,data.l, data.w,data.h, key);
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-width");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if( triggerComplete (e) )
						{
						var data = getImagePositionFromForm(self.myID);
							// must stay proportional
							data.h = data.w / self.ratioImage;
							var key = "console-text-image-width";
						self.imagePlace(data.t,data.l, data.w,data.h, key);
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-height");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if( triggerComplete (e) )
						{
						var data = getImagePositionFromForm(self.myID);
							// must stay proportional
							data.w = data.h * self.ratioImage;
							var key = "console-text-image-height";
						self.imagePlace(data.t,data.l, data.w,data.h, key);
						}
					// return false;
					});
					
			var action = $("#"+self.myID+"-image-move-left");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "image");
						var dX = -1 * moveIncrement;
						var dY = 0;
					self.moveDelta(dX,dY,"original"); // original units of image
					self.cropVerify();
					});
							 
			var action = $("#"+self.myID+"-image-move-right");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "image");
						var dX = 1 * moveIncrement;
						var dY = 0;
					self.moveDelta(dX,dY,"original"); // original units of image
					self.cropVerify();
					});
							 
			var action = $("#"+self.myID+"-image-move-down");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "image");
						var dX = 0;
						var dY = 1 * moveIncrement;
					self.moveDelta(dX,dY,"original"); // original units of image
					self.cropVerify();
					});
							 
			var action = $("#"+self.myID+"-image-move-up");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "image");
						var dX = 0;
						var dY = -1 * moveIncrement;
					self.moveDelta(dX,dY,"original"); // original units of image
					self.cropVerify();
					});
					
/***********************************  Crop Box MOVEMENTS *************/		
			var action = $("#"+self.myID+"-box-w");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-w";
							if(data.w > 0)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-box-h");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-h";
							if(data.h > 0)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-box-x1");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-x1";
							if(data.x1 >= 0 && data.x1 < data.x2)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-box-y1");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-y1";
							if(data.y1 >= 0 && data.y1 < data.y2)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
					
			var action = $("#"+self.myID+"-box-x2");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-x2";
								data.w = data.x2 - data.x1;
							if(data.w > 0)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-box-y2");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"box");
							var key = "console-text-box-y2";
								data.h = data.y2 - data.y1;
							if(data.h > 0)
								{
								self.boxPlace(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
					
	/********************  original dimensions */
			var action = $("#"+self.myID+"-image-w");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-w";
							if(data.w > 0)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-h");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-h";
							if(data.h > 0)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-x1");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-x1";
							if(data.x1 >= 0 && data.x1 < data.x2)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-y1");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-y1";
							if(data.y1 >= 0 && data.y1 < data.y2)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
					
			var action = $("#"+self.myID+"-image-x2");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-x2";
								data.w = data.x2 - data.x1;
							if(data.w > 0)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			var action = $("#"+self.myID+"-image-y2");
				action.bind(EVENT_KEYPRESS,function( e ) {
					// how do I know they are done ... special keys
					if(self.isBoxVisible)
						{
						if( triggerComplete (e) )
							{
							var data = getDataFromForm(self.myID,"image");
							var key = "console-text-image-y2";
								data.h = data.y2 - data.y1;
							if(data.h > 0)
								{
								self.boxPlaceOriginal(data.y1,data.x1,data.w,data.h, key);
								//self.updateConsole().cropVerify();
								self.cropVerify();
								}
							}
						}
					// return false;
					});
			
			
			
	/*************************  move crop box edges ***/	
			var action = $("#"+self.myID+"-boxedge-move-left-plus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-left-plus";
						data.x1 += moveIncrement;
						data.w 	-= moveIncrement;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});	
			var action = $("#"+self.myID+"-boxedge-move-left-minus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-left-minus";
						data.x1 -= moveIncrement;
						data.w 	+= moveIncrement;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});
			var action = $("#"+self.myID+"-boxedge-move-up-plus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-up-plus";
						data.y1 += moveIncrement;
						data.h 	-= moveIncrement;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});	
			var action = $("#"+self.myID+"-boxedge-move-up-minus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-up-minus";
						data.y1 -= moveIncrement;
						data.h 	+= moveIncrement;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});
					
					
					
					
					
			var action = $("#"+self.myID+"-boxedge-move-right-plus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-right-plus";
						data.x2 += moveIncrement;
						data.w 	+= moveIncrement;
						data.x1 = data.x2 - data.w;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});	
			var action = $("#"+self.myID+"-boxedge-move-right-minus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-right-minus";
						data.x2 -= moveIncrement;
						data.w 	-= moveIncrement;
						data.x1 = data.x2 - data.w;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});
					
			var action = $("#"+self.myID+"-boxedge-move-down-plus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-down-plus";
						data.y2 += moveIncrement;
						data.h 	+= moveIncrement;
						data.y1 = data.y2 - data.h;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});	
			var action = $("#"+self.myID+"-boxedge-move-down-minus");
				 action.click(function(e){
					//e.preventDefault();
					var moveIncrement = computeMoveIncrement(self, e, "cropedge");
					var data = getDataFromForm(self.myID,"box");
					var key = "console-move-down-minus";
						data.y2 -= moveIncrement;
						data.h 	-= moveIncrement;
						data.y1 = data.y2 - data.h;
					self.boxPlace(data.y1,data.x1,data.w,data.h, key);
						//self.updateConsole().cropVerify();
						self.cropVerify();
					});
					
					
					
					
	/*************************  move crop box ***/		
			var action = $("#"+self.myID+"-box-move-left");
				 action.click(function(e){
					//e.preventDefault();
					if(self.isBoxVisible)
						{
						var moveIncrement = computeMoveIncrement(self, e, "crop");
							var dX = -1 * moveIncrement;
							var dY = 0;
						self.moveBoxDelta(dX,dY,"scaled"); // scaled units of container
						self.cropVerify();
						}
					});
			var action = $("#"+self.myID+"-box-move-right");
				 action.click(function(e){
					//e.preventDefault();
					if(self.isBoxVisible)
						{
						var moveIncrement = computeMoveIncrement(self, e, "crop");
							var dX = 1 * moveIncrement;
							var dY = 0;
						self.moveBoxDelta(dX,dY,"scaled"); // scaled units of container
						self.cropVerify();
						}
					});
							 
			var action = $("#"+self.myID+"-box-move-down");
				 action.click(function(e){
					//e.preventDefault();
					if(self.isBoxVisible)
						{
						var moveIncrement = computeMoveIncrement(self, e, "crop");
							var dX = 0;
							var dY = 1 * moveIncrement;
						self.moveBoxDelta(dX,dY,"scaled"); // scaled units of container
						self.cropVerify();
						}
					});
							 
			var action = $("#"+self.myID+"-box-move-up");
				 action.click(function(e){
					//e.preventDefault();
					if(self.isBoxVisible)
						{
						var moveIncrement = computeMoveIncrement(self, e, "crop");
							var dX = 0;
							var dY = -1 * moveIncrement;
						self.moveBoxDelta(dX,dY,"scaled"); // scaled units of container
						self.cropVerify();
						}
					});
					
			var action = $("#"+self.myID+"-box-zoom-wand");
				 action.click(function(e){
					//e.preventDefault();
					//self.cropVerify(true);
						self.smartZoom(self.dragData.original);
						self.zoomTo(self.zoomFactor); // hasBox
						self.updateConsole();
						self.cropVerify(true);
					});
					
					
			var obj = $("#"+self.myID+"-box-toggle-controls");
				 obj.click(function(){
					 self.togglePoints();
					});
					
			var obj = $("#"+self.myID+"-box-toggle-ratio");
				 obj.click(function(){
					 self.toggleRatio();
					});
					
					
			var obj = $("#"+self.myID+"-toggle");  // this toggles the entire modal
				 obj.click(function(){
					var toggle = $(this);
					$("#"+self.myID+"-show-hide").slideToggle('slow', function() {
						if ($(this).is(":visible")) 
							{
							//toggle.text( 'on' );
							toggle.find($(".fa")).removeClass("fa-level-down").addClass("fa-level-up");
							self.$controls.css({"max-height": computeToggleHeight(self) + "px"});
							} 
							else 
								{
								//toggle.text( 'off' ); 
								toggle.find($(".fa")).removeClass("fa-level-up").addClass("fa-level-down");
								msgInfo.html(""); 
								msgInfo.hide();	
								self.$controls.css({"max-height":self.options.console.heightClosed + "px"});
								}        
						});
					});
			var action = self.$controls.find('[data-status]');
				action.bind(EVENT_MOUSEOVER,function( ) {
					var msg = $(this).data("status");
					if(!empty(msg))
						{
						msgInfo.html(msg); 
						msgInfo.show(); //.delay(self.options.timeout.messageLife).stop( true, true ).fadeOut();	
						}
					return false;
					});	
					
					
					}							
			return self;
			},
		boxPlaceOriginal: function(t,l, w,h, key=""){  
			var self = this;	
				var padding = self.options.box.padding;
				// set values as self.dragData.original
				self.dragData.original.x1 = l + padding/self.zoomFactor;
				self.dragData.original.y1 = t + padding/self.zoomFactor;
				
				self.dragData.original.w = w;
				self.dragData.original.h = h;
				
				self.dragData.original.x2 = l + w;
				self.dragData.original.y2 = t + h;
//console.log(self.dragData.original);			
				self.convertOriginalToScaled();
//console.log(self.dragData.original);	
					self.boxPlace(self.dragData.scaled.y1,self.dragData.scaled.x1, self.dragData.scaled.w, self.dragData.scaled.h, key, true);
			return self;
			},
			
		boxPlace: function(t,l, w,h, key="", force=false){  
			var self = this;
				if(key == "") { key = getMilliseconds(); } else { key = "" + getMilliseconds() + "-" + key; }
//console.log("boxPlace-> t: " + t + " l: " + l + " w: " + w + " h: " + h + " key: " + key);
					self.dragScaledToDrawCoords();
					var position = calculateRectPos(self.drawCoords);
						var mt = parseFloat(t);
							if(!force) { mt += self.options.box.padding; }
						var ml = parseFloat(l);
							if(!force) { ml += self.options.box.padding; }
//console.log(position);
						position.top 	= mt + "px";
						position.left 	= ml + "px";
						position.width 	= parseFloat(w) + "px";
						position.height = parseFloat(h) + "px";	
//console.log(position);
				// update it ... 
				self.drawCoords = getDataFromPosition(position); 				
				self.drawCoordsToDragScaled();
					drawPseudoModal(position, self.myID, self.boxWidth, self.boxHeight);
					// Set position and size
					self.drawingRect.css(position);	
					//self.updateConsole().cropVerify(); // moves bordered box ... 
			return self;
			},
		
		bindArrowMove: function (e) {
			var self = this;
				if(self.options.enable.arrowMove)
					{
					var mySwitch = computeSwitch(self.boxAction);
					var data = computeArrowMove(self, e);
					var dX = data.dX; var dY = data.dY;
//console.log(" dX: " + dX + " dY: " + dY);
					if(!empty(dX) || !empty(dY) )  // NaN and 0 are ignored
						{
						var d = computeDirection(self.boxAction);
						// what's moving
						var message = "";
						switch(mySwitch)
							{
							case "move-image":
								message = "[move-image] dx: "+dX+" dy: "+dY;
									self.moveDelta(dX,dY,"original"); // original units of image
									self.cropVerify();
							break;
							case "move-box":
								message = "[move-box] dx: "+dX+" dy: "+dY;
									self.moveBoxDelta(dX,dY,"scaled"); // scaled units of container
									self.cropVerify();
							break;
							case "move-point":
								message = "[move-point] ["+d+"] dx: "+dX+" dy: "+dY;
									var key = "arrow-move-["+d+"] dx: "+dX+" dy: "+dY;
									var data = computeArrowMoveEdge(self, d,dX,dY);
									self.boxPlace(data.y1,data.x1,data.w,data.h, key);
									self.cropVerify();
							break;
							}
self.doMessage(message);	
//console.log(data);		
						}		
					}			
			return self;
			},
		
		bindWheelZoom: function (event) {							
			var self = this;
				if(self.options.enable.wheelZoom)
					{
					var e = event.originalEvent || event;
					var direction = 1;
					//event.preventDefault();
						// Limit wheel speed to prevent zoom too fast
						if (self.scrollingLock) { return; }
						self.scrollingLock = true;
						clearTimeout($.data(this, 'timerWheel'));
						$.data(this, 'timerWheel', setTimeout(function() { self.scrollingLock = false; }, self.options.timeout.wheelCapture ));
					if (e.deltaY) 
						{
						direction = e.deltaY > 0 ? 1 : -1;
						} 
						else if (e.wheelDelta)	
							{
							direction = -e.wheelDelta / 120;
							} else if (e.detail)	
								{
								direction = e.detail > 0 ? 1 : -1;
								}
									
									
					if(direction <= 0) 
						{
						// scrolling up = zooming in
						var zoomIncrement = self.options.zoom.wheel;	
								var zoomFactor = self.zoomFactor + zoomIncrement;	
							var key = "wheel-zoom-in";
							self.scrollingLock = true; 
							self.zoomTo(zoomFactor, key);  // this also sets self.zoomFactor
							self.updateConsole();
							self.cropVerify();
						}
						else
							{
							// scrolling down = zooming out
							var zoomIncrement = self.options.zoom.wheel;	
								var zoomFactor = self.zoomFactor - zoomIncrement;	
							var key = "wheel-zoom-out";
							self.scrollingLock = true; 
							self.zoomTo(zoomFactor, key);  // this also sets self.zoomFactor
							self.updateConsole();
							self.cropVerify();
							}
				}
			return self;							
			},
						
						
						
						
						
						
		prepareFinalCrop: function() {
			var self = this;
				self.cropVerify();
				var data = self.dragData.original;
					$.each( data, function( key, value ) {
						var myValue = (validNumber(value)) ? Math.round(value) : trim(value);
						data[key] = myValue;
					});
					// rounding may have messed up x2, y2
					data.x2 = data.x1 + data.w;
					data.y2 = data.y1 + data.h;
				self.dragData.original = data;
				self.convertOriginalToScaled();	
				self.cropVerify();
				self.updateConsole();
					self.finalPrepared = true;
					self.options.methods.onFinalPreparation(self);
			return self;							
			},
			
		cropVerify: function(force=false) {
			var self = this;
//console.log("1: " + force);
//console.log("2: " + self.options.enable.autoWand);
//console.log("3: " + self.isBoxVisible);
			// set true values to rounded numbers, update the scaled
				if(force)
					{
					var data = getCropBoxCoords(self);				
					self.crop(data.x1, data.y1, data.x2, data.y2);	
					}
					else
						{
						//if(self.options.enable.autoWand)
							{						
							if(self.isBoxVisible)
								{
								var data = getCropBoxCoords(self);				
								self.crop(data.x1, data.y1, data.x2, data.y2);
								}
							}
						}
			return self;
			},
						
		crop: function(x1, y1, x2, y2) {  // manual crop in scaled [container] units
			var self = this;
				// let's load it into the main functions
				var e = {}; 
					e.pageX = x1 + self.containerOffsetLeft; 
					e.pageY = y1 + self.containerOffsetTop;
				self.startCrop(e,false);
					e.pageX = x2 + self.containerOffsetLeft; 
					e.pageY = y2 + self.containerOffsetTop;
				self.dragCrop(e,false);
				self.stopCrop(e,false);  // this has isInBounds
			return self;
			},
							
							
		convertUnits: function(data,key="",units="original") { // at minimum data has x1, y1
			var self = this;
				if(key == "") { key = getMilliseconds(); } else { key = "" + getMilliseconds() + "-" + key; }
				self.dragDataBackup[key] = self.dragData;
				self.dragData = resetObject("dragData"); // reset the data ... with x1, x2, y1, y2, w, h
					if(!isset(data.x2)) { data.x2 = data.x1 + 100; } // some arbitrary number
					if(!isset(data.y2)) { data.y2 = data.y1 + 150; } // some arbitrary number
					if(!isset(data.w)) { data.w = Math.abs(data.x2 - data.x1); }
					if(!isset(data.h)) { data.h = Math.abs(data.y2 - data.y1); }
				switch(data.units)
					{
					case "original":
						self.dragData.original = data;
						self.convertOriginalToScaled();	// CREATES self.dragData.scaled
					break;
					case "scaled":
						self.dragData.scaled = data;	
						self.convertScaledToOriginal();	// CREATES self.dragData.original
					break;
					}
			return self;
			},
								
						drawBox:  function(data) {
								var self = this;
//console.log(data);
									self.dragData = resetObject("dragData"); // reset the data ... 


										var x2 = data.left + data.width;
										var y2 = data.top + data.height;
									var obj = {x1: data.left, x2: x2, y1: data.top, y2: y2, h: data.height, w: data.width};	
									// zoomFit has already run ...
									switch(data.units)
										{
										case "original":
											self.dragData.original = obj;
											self.convertOriginalToScaled();
										break;
										case "scaled":
											self.dragData.scaled = obj;	
											self.convertScaledToOriginal();
										break;
										}
									self.crop(self.dragData.scaled.x1, self.dragData.scaled.y1, self.dragData.scaled.x2, self.dragData.scaled.y2 );
								return self;
								},
						
											
						
						
		convertScaledToOriginal: function(  ) {
			var self = this;
				// converting the drawn crop box ... not a single element ... 
				self.dragData.original.w = self.largeWidth * (self.dragData.scaled.w / self.sizeX);
				self.dragData.original.h = self.largeHeight * ( self.dragData.scaled.h / self.sizeY);
				// x's and y's need to be manipulated based on background image size and location
					// they already have the page offset computed ... 
					var x1 = self.dragData.scaled.x1 - self.placeX; // distance from left edge of image
					var y1 = self.dragData.scaled.y1 - self.placeY; // distance from top edge of image
				self.dragData.original.x1	= x1 / self.zoomFactor;
				self.dragData.original.x2 = self.dragData.original.x1 + self.dragData.original.w;
				self.dragData.original.y1	= y1 / self.zoomFactor;
				self.dragData.original.y2 = self.dragData.original.y1 + self.dragData.original.h;
			return self;
			},
		convertOriginalToScaled: function(  ) {
			var self = this;
				// converting the drawn crop box ... not a single element ... 
				self.dragData.scaled.w = self.sizeX * self.dragData.original.w / self.largeWidth;
				self.dragData.scaled.h = self.sizeY * self.dragData.original.h / self.largeHeight;
				self.dragData.scaled.x1 = (self.dragData.original.x1 * self.zoomFactor) + self.placeX;
				self.dragData.scaled.y1 = (self.dragData.original.y1 * self.zoomFactor) + self.placeY;
				self.dragData.scaled.x2 = self.dragData.scaled.x1 + self.dragData.scaled.w;
				self.dragData.scaled.y2 = self.dragData.scaled.y1 + self.dragData.scaled.h;
			return self;
			},
			
		show: function( preview=true ) {
			var self = this;
				if(preview && isset(self.previewInfo))
						{
						$.each(self.previewInfo.elements, function(i,value){
								if(isset(value.fobj)) { value.fobj.show(); }
							});
						}
					
				if(isset(self.$box)){ self.$box.show(); }
				if(isset(self.$controls)){ self.$controls.show(); }
				if(isset(self.$template)){ self.$template.show(); }
				if(isset(self.$elem)){ self.$elem.show(); }
			return self;
			},
			
		hide: function( preview=true ) {
			var self = this;
				if(preview && isset(self.previewInfo))
						{
						$.each(self.previewInfo.elements, function(i,value){
								if(isset(value.fobj)) { value.fobj.hide(); }
							});
						}
						
				if(isset(self.$box)){ self.$box.hide(); }
				if(isset(self.$controls)){ self.$controls.hide(); }
				if(isset(self.$template)){ self.$template.hide(); }
				if(isset(self.$elem)){ self.$elem.hide(); }
			return self;
			},
							
		destroy: function (selector) {
			var self = this; 
				// empty DOM ... 
				if(isset(self.previewInfo))
					{
					$.each(self.previewInfo.elements, function(i,value){
							if(isset(value.fobj)) { value.fobj.remove(); }
						});
					}
						
					if(isset(self.$controls)) 	{ self.$controls.remove(); }
					if(isset(self.$box)) 		{ self.$box.remove(); }
					// inside box
					/*
					if(isset(self.$crop)) 		{ self.$crop.remove(); }
					if(isset(self.$dragborder))	{ self.$dragborder.remove(); }
					if(isset(self.$pseudo))		{ self.$pseudo.remove(); }
					*/
					
					if(isset(self.$template))	{ self.$template.remove(); }
					
				
				self.$elem.empty(); // don't remove ... 
				
				/*
				
				if(bg.parent().length == 0) {
				   // removed succesfully
				} else {
				   // still somewhere in the dom
				}
				bg = null;
				*/
					
				//$(self).remove(); 				
				//$(self).removeData();
					self.$box.removeData();
					self.$controls.removeData();
					self.$template.removeData();
					
			//self.$elem.removeData(NAMESPACE);
			self.$elem.removeData();
				//$(this).data(NAMESPACE, (data = $.data( this, NAMESPACE, instance )));
				//$(self).removeData(NAMESPACE);
				//$(this).data(NAMESPACE) = null;
					
				self = null;
				
				//console.log(self);
			return self;
			}
			
			
		};
	
	$.fn.cropMe = function( option ) {
		var args = toArray(arguments, 1);
		var result;
		var notInitialized;
		this.each(function() {  // allows for multiple
			var data = $(this).data(NAMESPACE);
//console.log("data: ");
//console.log(data);
			var fn;
			var stringOption = (typeof option === 'string');
			notInitialized = (stringOption && isUndefined(data));
				if(notInitialized) { return undefined; } // hasn't been initialized ... only for this element of the .each
			
			var callFunction = (stringOption && $.isFunction(fn = data[option]));
			
//console.log("callFunction: "+callFunction);
			var options;
//console.log(data);		
			if (!data) 
				{
//console.log("CREATING DATA");
				/*
				if (/destroy/.test(option)) 
					{
					// we are destroying it ... why not...
					return;
					}
				*/
				
				if(!stringOption){options = option;}
				var instance = Object.create( cropMe );
					instance = instance.init( options, this );
				$(this).data(NAMESPACE, (data = $.data( this, NAMESPACE, instance )));
				}
//			data = $(this).data(NAMESPACE);
//console.log(data);		
//console.log("data2: ");
//console.log(data);			
			
				if (callFunction) 
					{
//console.log(args);
//console.log(data[option]);
					result = fn.apply(data, args);
//console.log(result);
					}
		});
		if(notInitialized) { return undefined; }
		return isUndefined(result) ? this : result;
	};
/*
onComplete: $.noop,
			onDestroy: function() {},
			*/
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
		
	 function toArray(obj, offset) {
    var args = [];
    // This is necessary for IE8
    if (validNumber(offset)) {
      args.push(offset);
    }
    return args.slice.apply(obj, args);
  }
  
  function calcMovePoint(data, dx, dy, d, self)	
	{
//console.log(" self.maintainAspectRatio: " + self.maintainAspectRatio + " d: " + d);
			//var ratio = data.w / data.h; // data is changing everytime ... 
			var ratio = self.movePointRatio;
//console.log("ratio: " + ratio + " dx: " + dx + " dy: " + dy);
			if(ratio > 1) { var dx_ = dy * ratio; } else { var dy_ = dx / ratio; }
			if(ratio > 1) { var _dx = -1*dy * ratio; } else { var _dy = -1*dx / ratio; }
					
		// biased to south and east ... 
		if(self.maintainAspectRatio || self.forceAspectRatio)
			{
			switch(d)
				{
				case "nw":
				case "se":
				case "s":
				case "e":
						if(ratio > 1) { dx = dx_; } else { dy = dy_; }
				break;
				
				case "ne":				
				case "sw":
				case "n":
				case "w":
						if(ratio > 1) { dx = _dx; } else { dy = _dy; }
				break;
				
				
				}
			}

			switch(d)
				{
				case "n":
					data.y1 += dy;
					data.h 	-= dy;
					
					//"e"
					if(self.maintainAspectRatio || self.forceAspectRatio)
						{
						data.x2 += dx;
						data.w 	+= dx;
						data.x1 = data.x2 - data.w;
						}
				break;
				
				case "nw":
					data.y1 += dy;
					data.h 	-= dy;
					
					data.x1 += dx;
					data.w 	-= dx;
				break;
				
				case "ne":
					data.y1 += dy;
					data.h 	-= dy;
					
					data.x2 += dx;
					data.w 	+= dx;
					data.x1 = data.x2 - data.w;
				break;
									
				case "s":
					data.y2 += dy;
					data.h 	+= dy;
					data.y1 = data.y2 - data.h;
					
					//"e"
					if(self.maintainAspectRatio || self.forceAspectRatio)
						{
						data.x2 += dx;
						data.w 	+= dx;
						data.x1 = data.x2 - data.w;
						}
				break;
				
				case "sw":
					data.y2 += dy;
					data.h 	+= dy;
					data.y1 = data.y2 - data.h;
					
					data.x1 += dx;
					data.w 	-= dx;
				break;
				
				case "se":
					data.y2 += dy;
					data.h 	+= dy;
					data.y1 = data.y2 - data.h;
					
					data.x2 += dx;
					data.w 	+= dx;
					data.x1 = data.x2 - data.w;
				break;
				
				case "w":
					// "s"
					if(self.maintainAspectRatio || self.forceAspectRatio)
						{
						data.y2 += dy;
						data.h 	+= dy;
						data.y1 = data.y2 - data.h;
						}
						
					data.x1 += dx;
					data.w 	-= dx; 
				break;
									
				case "e":
					// "s"
					if(self.maintainAspectRatio || self.forceAspectRatio)
						{
						data.y2 += dy;
						data.h 	+= dy;
						data.y1 = data.y2 - data.h;
						}
					
					data.x2 += dx;
					data.w 	+= dx;
					data.x1 = data.x2 - data.w;
				break;
				}
			return data;
			}	
			
	function resetObject(which="dragData")
		{
		// weird "rhs" assignment of objects within self/return self setup...
		// or maybe just a console.log bug, browser can't return value before changed...
		switch(which)
			{
			default:
				return { original: {x1:0, y1:0, x2:0, y2:0, w:0, h:0}, scaled: {x1:0, y1:0, x2:0, y2:0, w:0, h:0} }; // initial values, updating values get stored with [self.] ...
			break;
			
			case "myPoints":
				return {data:{}, sub:{}, direction:[], xmin:[],xmax:[],ymin:[],ymax:[]};
			break;
			}
		}
	function computeSwitch(str)
		{
		if(empty(str)) { return ""; }
		var mySwitch = str;
//console.log("computeSwitch->" + str);
			var tA = str.split("|");
			var d = (!empty(tA[1])) ? tA[1] : "";
//console.log("d->" + str);
//console.log("|"+d);
			mySwitch = mySwitch.split("|"+d).join("");
//console.log("computeSwitch->" + mySwitch);
		return mySwitch;
		}
	function computeDirection(str)
		{
		if(empty(str)) { return ""; }
			var tA = str.split("|");
			var d = (!empty(tA[1])) ? tA[1] : "";
		return d;
		}
	function getCropBoxCoords(self)
		{
		var data = {};
				// get from object
				var _x1 = self.dragData.scaled.x1;
				var _x2 = self.dragData.scaled.x2;
				var _y1 = self.dragData.scaled.y1;
				var _y2 = self.dragData.scaled.y2;
		data = {x1: _x1, y1: _y1, x2: _x2, y2: _y2};
		return data;
		}
	
		
	function triggerComplete( e )  // when a user types in an input field, certain keys mean they are done
		{
		var trigger = false;
			// https://css-tricks.com/snippets/javascript/javascript-keycodes/
		var key = e.which || e.keyCode || 0;
		if(key == 13)
			{
			trigger = true;
			}
		return trigger;
		}
		
	function computeMoveIncrement(self, e, which = "image")  // image, crop, cropedge
		{
		var moveIncrement = self.options.console.moveImage;
			if(which == "crop") 	{ moveIncrement = self.options.console.moveCrop;}
			if(which == "cropedge") { moveIncrement = self.options.console.moveCropEdge;}
			// if they click all 3, this order ??? ... or make absolute
			if(e.shiftKey) 
				{
				// Shift-Click
				moveIncrement = self.options.console.clickShift * moveIncrement;
				}
			if(e.ctrlKey) 
				{
				//Ctrl+Click
				moveIncrement = self.options.console.clickCntrl * moveIncrement;
				}
			if(e.altKey) 
				{
				//Alt+Click
				moveIncrement = self.options.console.clickAlt * moveIncrement;
				}
		return moveIncrement;										
		}
	
	function getDataFromForm(id,which="box")
		{
			
			var x1 = parseFloat( $("#"+id+"-"+which+"-x1")  	.val());
			var x2 = parseFloat( $("#"+id+"-"+which+"-x2")  	.val());
			var y1 = parseFloat( $("#"+id+"-"+which+"-y1")  	.val());
			var y2 = parseFloat( $("#"+id+"-"+which+"-y2")  	.val());
			var w  = parseFloat( $("#"+id+"-"+which+"-w") 		.val());
			var h  = parseFloat( $("#"+id+"-"+which+"-h")		.val());
		var data = {x1: x1, y1: y1, x2: x2, y2: y2, w: w, h: h};
		return data;
		}
	function getImagePositionFromForm(id)
		{
			var t = parseFloat( $("#"+id+"-image-top")		.val());
			var l = parseFloat( $("#"+id+"-image-left")		.val());						
			var w = parseFloat( $("#"+id+"-image-width")	.val());
			var h = parseFloat( $("#"+id+"-image-height")	.val());
		var data = {t:t, l:l, w:w, h:h};
		return data;
		}
		
	function getCropPosition(position, self)
		{
		var l 	= parseFloat(position.left   .split("px").join(""));
			l 	= l - self.options.box.border;
		var t 	= parseFloat(position.top    .split("px").join(""));
			t 	= t - self.options.box.border;
				position.left 	= l + "px";
				position.top 	= t + "px";
		return position;
		}
		
	function computeArrowMoveEdge(self, d,dX,dY)
		{
		var data = self.dragData.scaled;
		// a corner "se" can move the "s" up/down and the "e" left/right ... based on bind/trigger, only one will happen at a time....
		
		switch(d)
			{
			case "n":
				data.y1 += dY;
				data.h  -= dY;
			break;
			
			case "ne":
				data.y1 += dY;
				data.h  -= dY;
				
				data.x2 += dX;
				data.w 	+= dX;
				data.x1 = data.x2 - data.w;
			break;
			
			case "nw":
				data.y1 += dY;
				data.h  -= dY;
				
				data.x1 += dX;
				data.w 	-= dX;
			break;
			
			case "s":
				data.y2 += dY;
				data.h 	+= dY;
				data.y1 = data.y2 - data.h;
			break;
			
			case "se":
				data.y2 += dY;
				data.h 	+= dY;
				data.y1 = data.y2 - data.h;
				
				data.x2 += dX;
				data.w 	+= dX;
				data.x1 = data.x2 - data.w;
			break;
			
			case "sw":
				data.y2 += dY;
				data.h 	+= dY;
				data.y1 = data.y2 - data.h;
				
				data.x1 += dX;
				data.w 	-= dX;
			break;
			
			
			case "e":
				data.x2 += dX;
				data.w 	+= dX;
				data.x1 = data.x2 - data.w;
			break;
			
			case "w":
				data.x1 += dX;
				data.w 	-= dX;
			break;
			}		
			
		return data;
		}
	function computeArrowMove(self, e)
		{
		var which = "cropedge";  // default
			switch(self.boxAction)
				{
				case "move-image":
					which = "image";
				break;
				case "move-box":				
				case "crop":
					which = "crop";
				break;			
				}
		var moveIncrement = computeMoveIncrement(self, e, which);
		var key = e.which || e.keyCode || 0;
			switch(key) 
				{
				 // IJKL 
				case 38: // up
				case 33: // page up
				case 73: // I
				case 104: // 8 [keypad]
					var dX = 0;
					var dY = -1 * moveIncrement;
					e.preventDefault();
				break;
				
				case 37: // left
				case 36: // home
				case 74: // J
				case 100: // 4 [keypad]
					var dX = -1 * moveIncrement;
					var dY = 0;	
					e.preventDefault();								
				break;
				case 40: // down
				case 34: // page down
				case 75: // K
				case 98: // 2 [keypad]
					var dX = 0;
					var dY = 1 * moveIncrement;
					e.preventDefault();
				break;
				
				case 39: // right
				case 35: // end
				case 76: // L
				case 102: // 6 [keypad]
					var dX = 1 * moveIncrement;
					var dY = 0;				
					e.preventDefault();
				break;				
				}
		return {dX: dX, dY: dY};		
		}		
	function computeZoomIncrement(self, e)
		{
		var zoomIncrement = self.options.console.zoom;
			// if they click all 3, this order ??? ... or make absolute
			if(e.shiftKey) 
				{
				// Shift-Click
				zoomIncrement = self.options.console.clickShift * zoomIncrement;
				}
			if(e.ctrlKey) 
				{
				//Ctrl+Click
				zoomIncrement = self.options.console.clickCntrl * zoomIncrement;
				}
			if(e.altKey) 
				{
				//Alt+Click
				zoomIncrement = self.options.console.clickAlt * zoomIncrement;
				}
		return zoomIncrement;										
		}
	function checkZoomBoundary(z, self)
		{
		zoomFactor = parseFloat(z);
		if(!validNumber(zoomFactor)) { return self.zoomFactor; } // return what is
			if(z < self.options.zoom.min) 
				{ 
				zoomFactor = self.options.zoom.min; 
				}
			if(self.options.zoom.max)
				{
				if(z > self.options.zoom.max) 
					{ 
					zoomFactor = self.options.zoom.max; 
					}
				}
		return zoomFactor;			
		}
		
	function createRect(data)  // data must have x1,y1 to work...
		{
		var obj = $('<div/>').addClass('cropMe-drawing-rectangle').css({
											left: 	data.x1  + "px",
											top: 	data.y1 + "px",
											"display": "block",
											width: 	"0px",
											height: "0px"
											});
											//.appendTo(self.$box);
											//}).appendTo(document.body);
		return obj;
		}
	function calculateRectPos(data)  // data must have x1,x2,y1,y2,to work...
		{
		var width 	= data.x2 - data.x1;
		var height 	= data.y2 - data.y1;
		var posX 	= data.x1;
		var posY 	= data.y1;
            if (width < 0) 
				{
                width = Math.abs(width);
                posX -= width;
				}
            if (height < 0) 
				{
                height = Math.abs(height);
                posY -= height;
				}			
		return {left: posX + "px", top: posY + "px", width: width + "px", height: height + "px"};
		}
	function getDataFromPosition(position)
		{
		var data = {};
			data.x1 	= parseFloat(position.left   .split("px").join(""));
			data.y1 	= parseFloat(position.top    .split("px").join(""));
			data.w 		= parseFloat(position.width  .split("px").join(""));
			data.h 		= parseFloat(position.height .split("px").join(""));
			data.x2 	= data.x1 + data.w;
			data.y2 	= data.y1 + data.h;	
		return data;
		}
	function drawPseudoModal(position, myID, boxWidth, boxHeight)
		{
		var base = "#"+myID+" DIV.cropMe-pseudo-modal"; 
		var data = 	getDataFromPosition(position);
				// top goes from modal top to y1
				var obj = $(base + ".top");
						var w = boxWidth; var h = data.y1;
					obj.css({ 
							"position": "absolute", "top": "0px", "left": "0px",
							"width": w + "px", "height": h + "px" 
							});		
				// left goes from modal left to x1
				var obj = $(base + ".left");
						var w = data.x1; var h = data.h; 
						var t = data.y1;
					obj.css({ 
							"position": "absolute", "top": t + "px", "left": "0px",
							"width": w + "px", "height": h  + "px"
							});
				// right goes from modal right to x2
				var obj = $(base + ".right");
						var w = (boxWidth - data.x2); var h = data.h; 
						var t = data.y1; var l = data.x2;
					obj.css({ 
							"position": "absolute", "top": t + "px", "left": l + "px",
							"width": w  + "px", "height": h + "px"
							});
				// bottom goes from modal bottom to y2
				var obj = $(base + ".bottom");
						var w = boxWidth; var h = (boxHeight - data.y2); 
						var t = data.y2; 
					obj.css({ 
							"position": "absolute", "top": t + "px", "left": "0px",
							"width": w  + "px", "height":  h + "px"
							});				
		}
	function checkReversed(data)
		{
		var _data = data;
		// data must have x1,x2,y1,y2,to work... ...  w,h will be generated ...
//console.log("checkReversed#1 x1: "+ data.x1 + " x2: "+ data.x2 + " y1: "+ data.y1 + " y2: "+ data.y2 + " w: "+ data.w + " h: "+ data.h);
		var _x1 = _data.x1;
		var _y1 = _data.y1;
			// we want smaller first
			if(_data.x1 > _data.x2) {_data.x1 = _data.x2; _data.x2 = _x1;  _data.reversedX = true;}  
			if(_data.y1 > _data.y2) {_data.y1 = _data.y2; _data.y2 = _y1;  _data.reversedY = true;}
				_data.h = _data.y2 - _data.y1;
				_data.w = _data.x2 - _data.x1;
//console.log("checkReversed#2 x1: "+ _data.x1 + " x2: "+ _data.x2 + " y1: "+ _data.y1 + " y2: "+ _data.y2 + " w: "+ _data.w + " h: "+ _data.h);
		return _data;								
		}
	
		
	function computeToggleHeight(self)  // DOM objects must exist ...
		{
		var h = self.options.console.heightOpen;
		var showHide = $("#"+self.myID+"-show-hide");
			if (showHide.is(":hidden")) 
				{
				return self.options.console.heightClosed;
				}
			
		
		var imgInfo = $("#"+self.myID+"-image-info-row");									
		var boxInfo = $("#"+self.myID+"-box-info-row");			
		var boxInfo2 = $("#"+self.myID+"-box-info-row2");
//console.log("computeToggleHeight-> h: "+h);
			if (imgInfo.is(":hidden")) 
				{
				h = h - 66;
				}
//console.log("imgInfo-> h: "+h);
			if (boxInfo.is(":hidden")) 
				{
				h = h - 66;
				}
//console.log("boxInfo-> h: "+h);
			if (boxInfo2.is(":hidden")) 
				{
				h = h - 66;
				}
//console.log("boxInfo2-> h: "+h);
		return h;
		}
		
	// HELPER functions
	function getMilliseconds()
		{
		return new Date().getTime();
		}
	function validNumber(myNumber)
		{
		myTest = !(isNaN(myNumber-0));
		return myTest;
		}
	function isFunction(a) 
		{
		return typeof a == 'function';
		}
	function isString(a) 
		{
		return typeof a == 'string';
		}
	function isObject(a) 
		{
		return (a && typeof a == 'object') || isFunction(a);
		}
	function isArray(a) 
		{
		return isObject(a) && a.constructor == Array;
		}
	function isTrue(data)
		{
		if(typeof(data) == 'boolean') { return (data); }
		return null;
		}
	function isFalse(data)
		{
		if(typeof(data) == 'boolean') { return !(data); }
		return null;
		}
	function isNull(data)
		{
		return (data === null);
		}
	function isUndefined(data)
		{
		return (typeof(data) == 'undefined');
		}
	// http://www.myersdaily.org/joseph/javascript/md5.js
	// empty // http://www.sitepoint.com/testing-for-empty-values/
	// hacked to match http://php.net/manual/en/function.empty.php  ... false is empty
	function empty(data)
		{
		//if(typeof(data) == 'number' || typeof(data) == 'boolean') {  return false; }		
		if(data === null) { return true;  }						// null is empty
		if(typeof(data) == 'undefined') { return true;  }		// undefined is empty
		if(typeof(data) == 'number') {  return (data==0); }		// zero is empty
		if(typeof(data) == 'boolean') { return !(data); }		// false is empty
		if(data == "0" || data == "") { return true; }			// "" and "0" are empty
		if(typeof(data.length) != 'undefined')  {  return data.length == 0; } // object of any length > 0
		var count = 0;  // functions, regular expressions, elements, and so on...
		for(var i in data)
			{
			if(data.hasOwnProperty(i)) { count++; }
			}
		return count == 0;
		}
	function isset() 
		{
		var a = arguments, n = a.length, i = 0, undef;
		if (n === 0) { throw new Error('Empty isset'); }
		while (i !== n) {
						if (a[i] === undef || a[i] === null) { return false; }
						i++;
						}
		return true;
		}
	// Removes whitespaces 
	function trim( value ) 
		{
		// left 
		var re = /\s*((\S+\s*)*)/;
		value = value.replace(re, "$1");
		// right 
		var re = /((\s*\S+)*)\s*/;
		value = value.replace(re, "$1");
		return value;	
		}
	// gets select based on dfe (formName and elementName required)
	function getSelect(dfe)
		{
		var args=getSelect.arguments;var myReturn=(args[1])?"value":"index";
		for(i=0;i<dfe.length;i++)
			{
			if(dfe[i].selected==true)
				{
				if(myReturn=="value") { return dfe[i].value; }  else { return i; }
				}
			}
		}
	function defaultSelect(dfe,key)
		{
		for(i=0;i<dfe.length;i++)
			{
			if(key==dfe[i].value)
				{
				dfe[i].selected=true; return;
				}
			}
			number=dfe.length-1;
			dfe[number].selected=true;
		}
	function getSelectMultiple(dfe)
		{
		var dfe = document.getElementById(dfe).options;
		var args=getSelectMultiple.arguments;var myReturn=(args[1])?"value":"index";
		var j=0; var keys = [];
		for(i=0;i<dfe.length;i++)
			{
			if(dfe[i].selected==true)
				{
				if(myReturn=="value")
					{
					keys[j] = dfe[i].value;
					j++;
					}
					else
						{
						keys[j] = i;
						j++;
						}
				}
			}
		return keys;
		}
	function defaultSelectMultiple(dfe,keys)
		{
		if(isset(keys))
			{
			var dfe = document.getElementById(dfe).options;
			for(i=0;i<dfe.length;i++)
				{
				for(j=0;j<keys.length;j++)
					{
					if(keys[j]==dfe[i].value)
						{
						dfe[i].selected=true;
						}
					}
				}
			}
		}
	// radio buttons
	 function getCheckedValue(radioObj) 
		{
		if(!radioObj) { return ""; }
		var radioLength = radioObj.length;
		if(!isset(radioLength))
			{
			if(radioObj.checked) { return radioObj.value; } else { return ""; }
			}
		for(var i = 0; i < radioLength; i++) 
			{
			if(radioObj[i].checked) { return radioObj[i].value; }
			}
		return "";
		}
	function setCheckedValue(radioObj, newValue) 
		{
		if(!radioObj){ return; }
		var radioLength = radioObj.length;
		if(!isset(radioLength))
			{
			radioObj.checked = (radioObj.value == newValue.toString()); return;
			}
		for(var i = 0; i < radioLength; i++) 
			{
			radioObj[i].checked = false;
			if(radioObj[i].value == newValue.toString()) { radioObj[i].checked = true; }
			}
		}
	// http://jsfiddle.net/lamarant/ySXuF/
	function roundMe(value, decimals=1)
		{
		var val = value * Math.pow(10, decimals);
		var fraction = (Math.round((val-parseInt(val))*10)/10);
		if(fraction == -0.5) { fraction = -0.6; }
			val = Math.round(parseInt(val) + fraction) / Math.pow(10, decimals);
		return val.toFixed(decimals); // this is a string
		}
	
		
})( jQuery, window, document );
