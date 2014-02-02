/*
 PdMarker (for Google Maps API v3)

 ----------------------------------------

 Purpose: extends Google Map API google.maps.Map and google.maps.Marker
 Details:       http://www.pixeldevelopment.com/pdmarker.asp
 Updated:       [see getPdMarkerRevisionInfo]
 Author:        Peter Jones
 V3 Translator: Pedro Mourelle

 ----------------------------------------

*/

function getPdMarkerRevisionInfo() {
var cr = "<br/>";
var s =
"3.03  09/01/11 - added checkRisize expanding maps.Map.prototype" + cr +
"3.02  09/01/11 - upgraded zIndex management using v3 of Google Maps Api" + cr +
"3.01  08/02/11 - several bugs & errors fixed." + cr +
"3.00  07/27/11 - adapted to work using API 3 of google. Yeah baby!!" + cr +
"-------------------------------------------------------------------" + cr +
"2.03  10/02/07 - fixed zindex bug (setMarkerZIndex, topMarkerZIndex)" + cr +
"2.02  05/22/07 - fixed minor issues (blink, initDetailWin)" + cr +
"2.01  04/29/07 - improved left hand side detail window positioning, uses new Google setImage &amp; show " +
"routines for added reliability, fixed zoomToMarkers for single marker case." + cr +
"2.00  04/22/07 - fix for setImage when using Explorer 7." + cr +
"1.99f 07/09/06 - zoomToMarkers now takes into account markers not displayed." + cr +
"1.99e 05/05/06 - fixed zoomed tooltip positioning &amp; non-centered marker graphics." + cr +
"1.99d 05/01/06 - fixed display &amp; blink when defining .transparent." + cr +
"1.99c 04/25/06 - added display and blink." + cr +
"1.99b 04/21/06 - added 'Powered By' version &amp; marker count display." + cr +
"1.99a 04/18/06 - revised for Google Maps API Version 2, GMap2 required." + cr +
"0.99c 01/30/06 - added setDetailWinClass and resetDetailWinClass." + cr +
"0.99a 10/12/05 - now handles maps in containers with undefined widths" + cr +
"define a div with id 'pdmarkerwork' to reduce flicker" + cr +
"0.99  10/03/05 - added setImageEnabled, allowLeftTooltips (global)" + cr +
"0.98  09/30/05 - fixed zoomToMarkers" + cr +
"0.97  09/24/05 - added setHoverImage, setShowDetailOnClick, setDetailWinHTML, showDetailWin, closeDetailWin" + cr +
"0.96  09/22/05 - added setTooltipHiding, getTooltipHiding" + cr +
"0.95  09/20/05 - handle zoom for lingering tooltips mouseOutEnabled(false) " +
           "disables setImage and restoreImage" + cr +
"0.94  09/20/05 - added setTooltipClass and resetTooltipClass" + cr +
"0.93  09/19/05 - added slopPercentage [optional] parameter to zoomToMarkers" + cr +
"0.92  09/18/05 - added getMouseOutEnabled, setMouseOutEnabled" + cr +
"0.91  09/17/05 - fixed setOpacity";
return s;
}

function getPdMarkerVersion() {
    return getPdMarkerRevisionInfo().substring(0, 15);
}

function getPdMarkerShortVersion() {
    return getPdMarkerRevisionInfo().substring(0, 5);
}

function getGoogleMapsVersion() {
    var i, a, b, c, d, e, f, g;
    var APIkey = "";    // not used
    var v = "3";

    // this code seems to work just for googleMap v2. Used just for info.

    if (document.getElementsByTagName){
        for (i = 0; (a = document.getElementsByTagName("script")[i]); i++){
            if (a.getAttribute("src")) {
                b = a.getAttribute("src");
                c = b.indexOf("/mapfiles/maps"); // /mapfiles/maps
                d = b.indexOf("http://maps.google.com/maps?file=api");
                e = b.indexOf("key=");
                f = b.indexOf("/mapfiles/");
                g = b.indexOf("/maps");

                if (c > 0){
                    v = parseFloat(b.substring(c+14));
                } else {
                    if (f > 0){
                        v = "3." + b.substring(f+10,g);
                    }
                }
                if (d >= 0) {
                    if (e > 0) {
                        APIkey = b.substring(e+4);
                    }
                }
            }
        }
    }
    return v;
}


var pdMarkerExtList = [];


function PdMarkerAddToExtList(marker) {
    /*  Adds the marker to the list pdMarkerExtList.
    */
    pdMarkerExtList.push(marker);
}


function PdMarkerRemoveFromExtList(id) {
    /*  Removes the marker identified from the list pdMarkerExtList.
    */
    for (var i = 0; i < pdMarkerExtList.length; i++) {
        if (pdMarkerExtList[i].internalId == id) {
            pdMarkerExtList.splice(i, 1);
            return;
        }
    }
}


function PdMarkerFindInExtList(id) {
    /*  Looks for the marker identified in the list pdMarkerExtList.
    */
    for (var i = 0; i < pdMarkerExtList.length; i++) {
        if (pdMarkerExtList[i].internalId == id) {
            return pdMarkerExtList[i];
        }
    }
}


function PdMarkerClose(id) {
    /*  Close the DetailWin of the marker identified and removes it
        from the list pdMarkerExtList.
    */
    for (var i = 0; i < pdMarkerExtList.length; i++) {
        if (pdMarkerExtList[i].internalId == id) {
            pdMarkerExtList[i].closeDetailWin();
            pdMarkerExtList.splice(i, 1);
        }
    }
}


function PdMarkerBlinkOnOff(id) {
    /*  If blinking is enabled for the marker identified, it then
        switches blinking on/off.
    */
    var marker = PdMarkerFindInExtList(id);

    if (marker) {
        if (!marker.blinking) {
            return;
        }
        marker.blinkOn = !marker.blinkOn;
        marker.display(marker.blinkOn);
        setTimeout("PdMarkerBlinkOnOff(" + marker.getId() + ");", marker.blinkSpeed);
    }
}


// ALL PDMARKERS ARE MARKERS.
/*
function isPdMarker(a) {
}
*/


function getPdMarkerCount(a) {
    /* Returns the length of the pdMarkers array of object `a`
    */
    if (a.pdMarkers !== undefined){
        return a.pdMarkers.length;
    }
    return 0;
}


//  -----------------------------------------------------------
//
//  google.maps.Map extension for walking through PdMarker list
//
//  -----------------------------------------------------------

google.maps.Map.prototype.getMarkerById = function(id) {
    /* Returns the PdMarker identified by its id.
    */
    var marker = null;
    var total = getPdMarkerCount(this); // Total of PdMarkers contained in the map

    if (this.pdMarkers) {
        for (var i = 0; i < total; i++) {
            if (this.pdMarkers[i].internalId == id) {
                marker = this.pdMarkers[i];
                this.cursor = i;
                break;
            }
        }
    }
    return marker;
}


google.maps.Map.prototype.getFirstMarker = function() {
    /*  Returns the first PdMarker.
        Returns NULL in case of error or
    */
    return this.getNthMarker(0);
}


google.maps.Map.prototype.getNextMarker = function() {
    /* Returns the next PdMarker according to the current position
       of the cursor.
    */
    return this.getNthMarker(this.cursor + 1);
}


google.maps.Map.prototype.getNthMarker = function(n) {
    /* Returns the Nth PdMarker of the map.
    */
    var count = getPdMarkerCount(this);
    var marker = null;

    if (this.pdMarkers) {
        if ((n >= 0) && (n <= count)) {
            if (this.pdMarkers[n]) {
                marker = this.pdMarkers[n];
                this.cursor = n;
            }
        }
    }
    return marker;
}


google.maps.Map.prototype.getMarkerCount = function() {
    /*  Returns the length of the pdMarker array
    */
    return getPdMarkerCount(this);
}


google.maps.Map.prototype.boxMap = function(center, span) {
    /*  Extends the map view to show the new point `center` and
        set it as the center of the map.
    */
    var point = new google.maps.LatLng(center.x, center.y);
    var bounds = this.getBounds();

    bounds.extend(point);
    this.setCenter(point);
    this.fitBounds(bounds);
}


google.maps.Map.prototype.checkResize = function() {
    /*  Updates the map size if its container size changes
    */
    var center = this.getCenter();
    google.maps.event.trigger(this, 'resize');
    this.setCenter(center);
}


google.maps.Map.prototype.getSize = function(a){
    /*  Returns a google.maps.Size representing the size in
        pixels of the map.
        As v3 of the API misses this function, here there is.
    */

    var container = this.getDiv();        // div wrapping the map
    var width = container.offsetWidth;    // sizes of that div (borders included)
    var height = container.offsetHeight;

    return new google.maps.Size(width, height);
};


google.maps.Map.prototype.zoomToMarkers = function(slopPercentage, heightOffsetPct) {
    /*  Fits the map to the markers included taking care of a
        padding between the markers and the map bounds.
    */
    var count = 0;                               // markers counter
    var thePoint, x, y, minX, maxX, minY, maxY;  // rectangle vertices and temps
    var marker = null;                           // markers iterator

    marker = this.getFirstMarker();

    while (marker){
        /*  this while sets the mins and maxs drawing a rectangle that wraps
            all the markers
        */
        if (marker.getVisible()){

            thePoint = marker.getPosition();
            x = thePoint.lat();
            y = thePoint.lng();

            if (count == 0) {
                minX = x;
                maxX = x;
                minY = y;
                maxY = y;
            } else {
                if (x < minX) {minX = x;}
                if (x > maxX) {maxX = x;}
                if (y < minY) {minY = y;}
                if (y > maxY) {maxY = y;}
            }
            count++;
        }
        marker = this.getNextMarker();
    }

    if (count == 1) {
        // one marker => map centered in that only marker
        this.setCenter(new google.maps.LatLng(x,y), this.getZoom());
    } else {
        if (count > 1) {
            // the center of all the markers
            var center = new google.maps.LatLng((minX + maxX) / 2, (minY + maxY) / 2);
            var span = new google.maps.Size(Math.abs(maxX - minX), Math.abs(maxY - minY));
            var slopWid = 0;
            var slopHgt = 0;

            if (typeof slopPercentage !== undefined) {
                slopWid = span.width * slopPercentage / 200;
                slopHgt = span.height * slopPercentage / 200;
                span.width  *= 1 + slopPercentage / 100;
                span.height *= 1 + slopPercentage / 100;
            }

            if (typeof heightOffsetPct !== undefined) {
                var deltaHgt = span.height * heightOffsetPct / 100;
                center = new google.maps.LatLng(center.lat() + deltaHgt, center.lng());
            }

            // sw, ne
            var bounds = new google.maps.LatLngBounds(
                            new google.maps.LatLng(minX - slopHgt, minY - slopWid),
                            new google.maps.LatLng(maxX + slopHgt, maxY + slopWid)
                         );
            this.fitBounds(bounds);
        }
    }
}


function shorten(x) {
    /*  This function is kind of "decimal reductor" for number `x`.
    */
    var factor = 1000000;
    return Math.round(x * factor) / factor;
}


function poweredByClick(map) {
    /* Construct the URL to get to google maps website
       centered in the current position.
    */
    var center = map.getCenter();
    var span = map.getBounds().toSpan();
    var zoom = map.getZoom();
    var maps_url = "http://maps.google.com/maps?ll=";
    var api = "";

    if (APIkey) {
        api = "&key=" + APIkey;
    }

    var url = maps_url + center.lat() + "," + center.lng() + "&spn=" + shorten(span.lat()) + "," + shorten(span.lng()) + "&z=" + zoom + api;
    document.location = url;
}


function poweredByMouseover(map) {
    /* Determines how many markers are visible and exist in
       the current screen
    */
    var marker = null;
    var bounds = map.getBounds();
    var visibleCount = 0;
    var totalCount = 0;
    var title = null;

    marker = map.getFirstMarker();
    while (marker) {
        if (marker.getVisible()) {
            if (bounds.contains(marker.getPosition())) {
                // the marker is visible in the current screen
                visibleCount++;
            }
            totalCount = totalCount + 1;
        }
        marker = map.getNextMarker();
    }
    title = map.poweredByTitle + " (" + visibleCount + " markers of " + totalCount + " visible)";
    map.poweredByObj.setAttribute("title", title);
    map.poweredByObj.setAttribute("alt", title);
}


function getPoweredBy(map) {
    try {
        var tooltip = "Google Maps " + getGoogleMapsVersion() + " & PdMarker " + getPdMarkerShortVersion();
        map.poweredByTitle = tooltip;

        var b = document.createElement("img");
        b.setAttribute("src", "http://www.google.com/intl/en_ALL/mapfiles/transparent.gif");
        b.setAttribute("width", 62);
        b.setAttribute("alt", tooltip);
        b.setAttribute("title", tooltip);
        b.setAttribute("height", 30);
        b.style.display = "block";
        b.style.position = "absolute";
        b.style.left    = "2px";
        b.style.bottom  = "0px";
        b.style.width   = "62px";
        b.style.height  = "30px";
        b.style.cursor  = "pointer";
        b.style.zIndex  = 600001;
        b.onclick = function() { poweredByClick(map); };
        b.onmouseover = function() { poweredByMouseover(map); };
        map.getDiv().appendChild(b);
        return b;
    }
    catch (e) {
        //console.debug("Error: " + e);
    }
    return true;
}


function setPoweredBy(map) {
    if (!map.poweredByObj) {
        // possibly reduce IE memory leak, unchecked
        getGoogleMapsVersion();
        map.poweredByObj = getPoweredBy(map);
    }
}


//////////////////////////////////////////////////
// PdMarker code

function PdMarkerNamespace() {

var userAgent = navigator.userAgent.toLowerCase();
var n4 = (document.layers);
var n6 = (document.getElementById && !document.all);
var ie = (document.all);
var o6 = (userAgent.indexOf("opera") != -1);
var safari = (userAgent.indexOf("safari") != -1);
var msie  = (userAgent.indexOf("msie") != -1) && (userAgent.indexOf("opera") == -1);
var msiePre7 = false;

if (msie){
    msiePre7 = userAgent.substr(userAgent.indexOf("msie") + 5, 2) < 7;
}

// Globals

var nextMarkerId = 10;
var permitLeft = true;

// default marker shadow
var shadowUrl = "http://www.google.com/mapfiles/shadow50.png";
// params: (url, size, origin, anchor)
var iconShadow = new google.maps.MarkerImage(
        shadowUrl,
        new google.maps.Size(37, 40),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 35));

// default icon
// params: (url, size, origin, anchor)
var iconImg = new google.maps.MarkerImage(
        "http://www.google.com/mapfiles/marker.png",
        new google.maps.Size(20, 34),
        new google.maps.Point(9, 34),
        new google.maps.Point(9, 2));


// estimated icon sizes - used for tooltip positioning
var iconHeight = 34;
var iconWidth = 20;


function PdMarker(latlng, markerimg, tooltip) {
    /* creates a new instance of PdMarker.
       PdMarker is a subclass of google.maps.Marker with extra properties
       @latlng (LatLng): the coords where the marker will be located.
       @markerimg (MarkerImage): is the ppal image (the icon) for the marker
       @tooltip (??): ??
    */

    google.maps.Marker.apply(this, arguments);

    // icon by default if no provided
    if (!markerimg){
        markerimg = iconImg;
    }
    this.oldImagePath = markerimg.url;

    // initial data
    this.setImage(markerimg);
    this.setShadow(iconShadow);
    this.setPosition(latlng);

    if (tooltip){
        this.pendingTitle = tooltip;
    } else {
        this.pendingTitle = "";
    }

    this.internalId = nextMarkerId;
    nextMarkerId += 1;
    this.zIndexSaved = false;
    this.pendingCursor = "";
    this.percentOpacity = 80;
    this.mouseOutEnabled = true;
    this.setImageOn = true;
    this.hidingEnabled = true;
    this.showDetailOnClick = true;
    this.detailOpen = false;
    this.userData = "";
    this.displayed = true;
}


/*  PdMarker is a Marker subclass
*/
PdMarker.prototype = new google.maps.Marker();


google.maps.Map.prototype.addMarkerToMapList = function(marker) {
    /*  Adds the PdMarker to the map list. If the list doesn't
        exist, it creates it.
    */
    if (this.pdMarkers === undefined) {
        this.pdMarkers = new Array();
    }
    this.pdMarkers.push(marker);
}


google.maps.Map.prototype.removeMarkerFromMapList = function(marker) {
    /*  Removes a PdMarker from the map list.
    */
    var id = marker.internalId;

    for (var i = 0; i < this.pdMarkers.length; i++) {
        if (this.pdMarkers[i].internalId == id) {
            this.pdMarkers.splice(i, 1);
            return;
        }
    }
}


PdMarker.prototype.addToMap = function(map) {
    /*  Adds the marker to the map given. And binds the mouse events.
    */

    // set the marker in the map
    this.setMap(map);

    // fix needed for getPanes() within this function
    setPoweredBy(map);

    map.addMarkerToMapList(this);

    if ((this.pendingTitle) && (this.pendingTitle.length > 0)) {
        this.setTitle(this.pendingTitle);
    }

    if ((this.pendingCursor) && (this.pendingCursor.length > 0)) {
        this.setCursor(this.pendingCursor);
    }

    google.maps.event.addDomListener(this, "mouseover", this.onMouseOver);
    google.maps.event.addDomListener(this, "mouseout", this.onMouseOut);
    google.maps.event.addDomListener(this, "click", this.onClick);
    google.maps.event.addDomListener(this.map, "zoomend", this.reZoom);
}


PdMarker.prototype.allowLeftTooltips = function(a) {
    /* Sets whether the Tooltips could be at the left or not
    */
    permitLeft = a;
}


PdMarker.prototype.reZoom = function() {
    /*  TODO: what this function is supposed to do??
    */
    var didSet = false;

    if (this.tooltipObject) {
        if (this.tooltipObject.style.display == "block") {
            setTTPosition(this);
            didSet = true;
        }
    }

    if (this.detailObject) {
        if (!didSet) {
            setTTPosition(this);
        }
        setDetailPosition(this);
    }
}


// InternalId setter / getter
PdMarker.prototype.setId = function(id) {
    this.internalId = id;
}
PdMarker.prototype.getId = function() {
    return this.internalId;
}


// Name setter / getter
PdMarker.prototype.setName = function(a) {
    this.name = a;
}
PdMarker.prototype.getName = function() {
    if (this.name) {
        return this.name;
    } else {
        return null;
    }
}


// UserData setter/getter
PdMarker.prototype.setUserData = function(a) {
    this.userData = a;
}
PdMarker.prototype.getUserData = function() {
    if (this.userData) {
        return this.userData;
    } else {
        return "";
    }
}


// UserData2 setter/getter
PdMarker.prototype.setUserData2 = function(a) {
    this.userData2 = a;
}
PdMarker.prototype.getUserData2 = function() {
    if (this.userData2){
        return this.userData2;
    } else {
        return "";
    }
}


PdMarker.prototype.setImageEnabled = function(a) {
    /*  Sets whether the image is on or off.
    */
    this.setImageOn = a;
}


var PdMIN = "";
var PdMIA = "";

function PdCompPdMIN(marker) {
    if ((marker) || (PdMIN.length == 0)) {
        return;
    }
    for (var i in marker) {
        if (eval("typeof marker." + i) == "object") {
            try {
                if (eval("typeof marker." + i + "[0].src") !== "undefined") {
                    PdMIA = "this." + i;
                    PdMIN = PdMIA + "[0]";
                }
            }
            catch (e) {}
        }
    }
}


PdMarker.prototype.setImageOld = function(a) {
    /*  Image to be replaced is stored for later restore
    */
    var msFilter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + a + '")';

    google.maps.Marker.prototype.initialize.call(this, a);

    if (this.mouseOutEnabled && this.setImageOn) {
        PdCompPdMIN(this);
        try {
            if (this.oldImagePath.length == 0) {
                eval("this.oldImagePath = " + PdMIN + ".src");
            }
            if (msie && msiePre7) {
                eval(PdMIN + ".style.filter = msFilter");
            }
            else {
                eval(PdMIN + ".src = a");
            }
        }
        catch (e) {}
    }
}


PdMarker.prototype.setIcon = function(a) {
    /*  Changes the marker icon image with the one given (`a`).
        @a: url of the image or MarkerImage instance
    */
    google.maps.Marker.prototype.setIcon.call(this, a);
}


PdMarker.prototype.getPixels = function(map){
    /*  Returns the pixel coordinates (google.maps.Point) of
        the marker position with respect to the actual viewport of `map`.
    */
    var pos_ = this.getPosition();      // latlng marker position
    var scale_ = Math.pow(2, map.getZoom());    // map scale
    var bounds = map.getBounds();

    if (!map || !bounds) {
        return new google.maps.Point(0,0);
    }

    // the (0,0) coord (relative to the visible map)
    var nw_ = new google.maps.LatLng(
            bounds.getNorthEast().lat(),
            bounds.getSouthWest().lng()
        );
    var worldCoordinateNW_ = map.getProjection().fromLatLngToPoint(nw_);
    var worldCoordinate_ = map.getProjection().fromLatLngToPoint(pos_);

    var pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate_.x - worldCoordinateNW_.x) * scale_),
            Math.floor((worldCoordinate_.y - worldCoordinateNW_.y) * scale_)
        );

    return pixelOffset;
}


PdMarker.prototype.setImage = function(a) {
    /*  Sets the image given (`a`) as new icon for the marker
    */
    if (this.mouseOutEnabled && this.setImageOn) {
        this.setIcon(a);
    }
}


PdMarker.prototype.restoreImage = function() {
    /*  Restores the normal icon for this pdmarker
    */
    if (this.mouseOutEnabled && this.setImageOn && this.oldImagePath.length > 0) {
        this.setImage(this.oldImagePath);
    }
}


PdMarker.prototype.display = function(a) {
    /*  Shows or Hides the PdMarker
    */
    if (a) {
        this.show();
    } else {
        this.hide();
    }
}


PdMarker.prototype.blink = function(blink, speed) {
    /*  Starts (or stops) the blinking of the marker. If starts, `speed`
        determines the blinking speed.
    */
    if (blink) {
        this.blinkOn = true;
        this.blinkSpeed = speed;

        if (!this.blinking) {
            this.blinking = blink;
            PdMarkerAddToExtList(this);
            PdMarkerBlinkOnOff(this.getId());
        }
    } else {
        this.blinking = blink;
        this.display(true);
        PdMarkerRemoveFromExtList(this);
    }
}


PdMarker.prototype.getIconSize = function() {
    /*  Returns a Size representing the icon size of the marker.
        This function is missing in actual Marker v3 of API

        pixelBounds doesn't work. Requires further development.

        Currently using the global vars iconWidth and iconHeight as standard
        values.
    */
    return new google.maps.Size(iconWidth, iconHeight);
}


PdMarker.prototype.setMarkerZIndex = function(a) {
    /*  Sets the marker Zindex
    */

    //PdCompPdMIN(this);
    if (!this.zIndexSaved) {
        this.oldZIndex = this.getZIndex();
        this.zIndexSaved = true;
    }
    this.setZIndex(a);
}


PdMarker.prototype.topMarkerZIndex = function() {
    /*  Sets the marker with a high z-index for being
        on top of the others.
    */
    this.setMarkerZIndex(600000);
}


PdMarker.prototype.restoreMarkerZIndex = function() {
    /*  Restores the previous saved marker zIndex
    */
    if (this.zIndexSaved) {
        this.setZIndex(this.oldZIndex);
        this.zIndexSaved = false;
    }
}


// TODO : investigate onInfoWindowOpen function. Is correct?
PdMarker.prototype.onInfoWindowOpen = function() {
    this.hideTooltip();
    google.maps.Marker.prototype.infoWindowOpen.call(this);
}


PdMarker.prototype.setHoverImage = function(a) {
    this.hoverImage = a;
}


var inMouseOver = false;

PdMarker.prototype.onMouseOver = function() {
    /*  Function to be executed when mouse is over a pdmarker.
    */
    if (inMouseOver){
        return;
    }

    inMouseOver = true;

    if (this.hoverImage) {
        // change the marker icon image
        this.setImage(this.hoverImage);
    }

    if (!this.detailOpen) {
        // shows tooltip for this marker
        this.showTooltip();
    }

    inMouseOver = false;
}


PdMarker.prototype.onMouseOut = function() {
    /*  Function to be executed when marker loses mouse focus.
    */

    if (this.hoverImage) {
        this.restoreImage();
    }

    if (!this.detailOpen) {
        if (this.mouseOutEnabled) {
            this.hideTooltip();
        }
    }
}


// SetMouseOutEnabled setter/getter
PdMarker.prototype.setMouseOutEnabled = function(a) {
    this.mouseOutEnabled = a;
}
PdMarker.prototype.getMouseOutEnabled = function() {
    return this.mouseOutEnabled;
}

// TooltipHiding setter/getter
PdMarker.prototype.setTooltipHiding = function(a) {
    this.hidingEnabled = a;
}
PdMarker.prototype.getTooltipHiding = function() {
    return this.hidingEnabled;
}


PdMarker.prototype.setTitle = function(a) {
    this.tooltipText = "";
    PdCompPdMIN(this);

    try {
        eval(PdMIN + ".title = a");
    }
    catch (e) {
        this.pendingTitle = a;
    }
}


PdMarker.prototype.setCursor = function(a) {
    PdCompPdMIN(this);
    try {
        eval(PdMIN + ".style.cursor = a");
    }
    catch (e) {
        this.pendingCursor = a;
    }
}


PdMarker.prototype.setTooltipClass = function(a) {
    this.pendingClassName = a;

    if (this.tooltipObject) {
        var showing = (this.tooltipObject.style.display != "none");
        this.deleteObjects();

        if (this.tooltipRaw) {
            this.setTooltipNoResize(this.tooltipRaw);
        }
        if (showing) {
            this.showTooltip();
        }
    } else {
        if (this.tooltipRaw) {
            this.setTooltipNoResize(this.tooltipRaw);
        }
    }
}


PdMarker.prototype.resetTooltipClass = function() {
    this.setTooltipClass("markerTooltip");
}


PdMarker.prototype.getTooltip = function() {
    try {
        return this.tooltipRaw;
    }
    catch (e) {
        return "";
    }
}


PdMarker.prototype.setTooltipNoResize = function(a) {
    this.setTitle("");
    var ttClass = "markerTooltip";

    if (this.pendingClassName) {
        ttClass = this.pendingClassName;
    }
    this.tooltipRaw = a;
    this.tooltipText =  a;

    if (this.tooltipObject) {
        this.tooltipObject.innerHTML = this.tooltipText;
    }
}


PdMarker.prototype.setTooltip = function(a) {
    this.setTooltipNoResize(a);
    this.deleteObjects();
}


PdMarker.prototype.showTooltip = function() {
    /*  Displays the tooltip for the current marker
    */
    if (this.tooltipText) {
        if (!this.tooltipObject) {
            initTooltip(this);
        }
        setTTPosition(this);
        this.tooltipObject.style.display = "block";
    }
}


PdMarker.prototype.hideTooltip = function() {
    /*  Hides the tooltip for the current marker
    */
    if (this.tooltipObject) {
        if (this.hidingEnabled) {
            this.tooltipObject.style.display = "none";
        }
    }
}


PdMarker.prototype.onClick = function(a) {
    /*  Click on the marker make a html window appear in the
        middle of the map.
    */
    if (this.showDetailOnClick && this.detailWinHTML) {
        for (var i = 0; i < pdMarkerExtList.length; i++) {
            pdMarkerExtList[i].closeDetailWin();
            pdMarkerExtList.splice(i, 1);
        }
        this.showDetailWin();
    }
}


PdMarker.prototype.setShowDetailOnClick = function(a) {
    /* @a (boolean) : whether details are shown or not on click
    */
    this.showDetailOnClick = a;
}


PdMarker.prototype.setDetailWinHTML = function(a) {
    this.detailWinHTML = a;
}


PdMarker.prototype.setDetailHREF = function(a) {
    this.detailHREF = a;
}


PdMarker.prototype.setDetailWinClass = function(a) {
    this.pendingDetailClassName = a;
}


PdMarker.prototype.resetDetailWinClass = function() {
    this.setDetailWinClass("markerDetail");
}


PdMarker.prototype.showDetailWin = function() {
    /*  Displays the html window assigned to this marker
    */
    if (this.detailOpen) {
        this.closeDetailWin();
        return;
    }

    this.hideTooltip();
    this.setMouseOutEnabled(false);

    var winClass = "markerDetail";

    if (this.pendingWinClassName){
        winClass = this.pendingWinClassName;
    }

    var url = this.detailHREF;
    var html = this.detailWinHTML.replace("+this.internalId+", this.internalId);

    this.detailOpen = true;

    if (!this.tooltipText) {
        this.ttWidth = 150;
        this.ttHeight = 60;
        setTTPosition(this); // compute ttTop, ttLeft
    }

    // infowindow displayed as fixed
    initDetailWin(this, 45, 85, html);
    //initDetailWin(this, this.ttTop - 400, this.ttLeft - 250, html);
    PdMarkerAddToExtList(this);
    ajaxitem(url);
}


PdMarker.prototype.closeDetailWin = function() {
    /*  Closes the html window assigned to this marker
    */
    this.detailOpen = false;

    if (this.detailObject) {
        this.setMouseOutEnabled(true);
        this.getMap().getDiv().removeChild(this.detailObject);
        this.detailObject = null;
    }
}


PdMarker.prototype.deleteObjects = function() {
    /*  Deletes the visual elements of the marker (tooltip & infowindow)
    */
    if (this.tooltipObject) {
        this.getMap().getDiv().removeChild(this.tooltipObject);
        this.tooltipObject = null;
    }
    this.closeDetailWin();
}


PdMarker.prototype.remove = function(a) {
    /*  Removes the marker and the info included
    */
    if (this.map) {
       this.map.removeMarkerFromMapList(this);
    }
    PdMarkerRemoveFromExtList(this.getId());
    this.deleteObjects();
    this.setMap(null);
}


PdMarker.prototype.setOpacity = function(opacity) {
    setObjOpacity(this.objId, opacity);
}



// ***** Private routines *****

function setObjOpacity(objId, opacity) {
    /* Sets the opacity given to the object `objId`
    */

    var op = opacity;

    // normalization
    if (op < 0) {op = 0;}
    if (op >= 100) {op = 100;}

    var c = op / 100;

    this.percentOpacity = op;

    var obj = document.getElementById(objId);

    if (obj) {
        if (typeof(obj.style.filter) == 'string') {
            obj.style.filter = 'alpha(opacity:' + op + ')';}
        if (typeof(obj.style.KHTMLOpacity) == 'string') {
            obj.style.KHTMLOpacity = c;}
        if (typeof(obj.style.MozOpacity) == 'string') {
            obj.style.MozOpacity = c;}
        if (typeof(obj.style.opacity) == 'string') {
            obj.style.opacity = c;}
    }
}


function idToElemId(id) {
    /* Adds a prefix to the string `id` given
    */
    return "ttobj" + id;
}


function initTooltip(theObj) {
    /* Initiallize the tooltip for the object `theObj`
    */

    var body_elem = document.body;
    var new_elem = document.createElement('span');

    theObj.objId = idToElemId(theObj.internalId);
    theObj.anchorLatLng = theObj.getPosition();

    theObj.tooltipObject = new_elem;
    new_elem.setAttribute('id', theObj.objId);
    new_elem.innerHTML = theObj.tooltipText;

    // append to body for size calculations
    // we prevent the access to 'map' element
    //var d = document.getElementById("map");
    body_elem.appendChild(new_elem);
    new_elem.style.position = "absolute";
    new_elem.style.bottom = "5px";
    new_elem.style.left = "5px";
    new_elem.style.zIndex = 1;

    if (theObj.percentOpacity) {
        theObj.setOpacity(theObj.percentOpacity);
    }

    var tempObj = document.getElementById(theObj.objId);
    theObj.ttWidth  = tempObj.offsetWidth;
    theObj.ttHeight = tempObj.offsetHeight;
    body_elem.removeChild(new_elem);

    new_elem.style.zIndex = 600000;
    new_elem.style.bottom = "";
    new_elem.style.left = "";
    theObj.getMap().getDiv().appendChild(new_elem);
}


function initDetailWin(theObj, top, left, html) {
    /*  Displays the `html` given on top of the map containing
        the marker, at positions given.
    */
    var spanEl = document.createElement('span');
    var map = theObj.getMap();

    theObj.detailId = "detail" + theObj.internalId;
    theObj.detailObject = spanEl;

    spanEl.setAttribute('id',theObj.detailId);
    spanEl.innerHTML = html;
    spanEl.style.display = "block";
    spanEl.style.position = "absolute";
    spanEl.style.top  = top + "px";
    spanEl.style.left = left + "px";
    spanEl.style.zIndex = 600001;

    map.getDiv().appendChild(spanEl);
}


function setTTPosition(theObj) {
    /*  Stablish the position of the tooltip that will be displayed
        when some marker is selected/hovered.
    */
    var map = theObj.getMap();          // Map that contains the marker
    var pos = theObj.getPosition();     // LatLng of the marker
    var ttPos = theObj.getPixels(map);  // relative coords in pixels in the map
    var icon = theObj.getIcon();        // marker icon
    var gap = 5;                        // tooltip distance from the marker
    var rightSide = true;                   // The tooltip fits at the right of marker
    var bounds = map.getBounds();
    if (!map || !bounds){
        //console.debug("Map not loaded yet. Tooltip not visible yet.");
        return false;
    }
    var boundsSpan = bounds.toSpan();
    var mapWidth = map.getSize().width;     // map width in pixels
    var mapHeight = map.getSize().height;   // map height in pixels

    theObj.ttWidth = 175;       // tooltip width in pixels
    ttHeight_ = 85;             // tooltip (fixed) height in pixels

    var tooltipWidthInDeg = (theObj.ttWidth + theObj.getIconSize().width) / mapWidth * boundsSpan.lng();
    var tooltipHeightInDeg = (theObj.ttHeight + theObj.getIconSize().height) / mapHeight * boundsSpan.lat();

    // if the tooltip cannot be shown at the right of the marker
    if (pos.lng() + tooltipWidthInDeg > bounds.getNorthEast().lng() && permitLeft){
        rightSide = false;
    }

    // tooltip top aligned with top border of icon
    ttPos.y -= Math.floor(theObj.getIconSize().height);

    // if the tooltip cannot be shown down of the marker
    if ((pos.lat() - tooltipHeightInDeg) < (bounds.getSouthWest().lat())) {
        // tooltip bottom aligned with bottom border of icon
        ttPos.y -= (ttHeight_ - theObj.getIconSize().height);
    }

    // since the border of the icon + gap
    var deltaX = Math.floor(iconWidth / 2) + gap;

    if (rightSide) {
        ttPos.x += deltaX;
    } else {
        ttPos.x -= (deltaX + theObj.ttWidth);
    }

    theObj.rightSide = rightSide;
    theObj.ttLeft = ttPos.x;
    theObj.ttTop  = ttPos.y;

    if (theObj.tooltipObject) {
        theObj.tooltipObject.style.left = ttPos.x + "px";
        theObj.tooltipObject.style.top  = ttPos.y + "px";
        theObj.tooltipObject.style.right = null;
    }
}


function makeInterface(a) {
    var b = a || window;
    b.PdMarker = PdMarker;
}


makeInterface();
}


PdMarkerNamespace();
