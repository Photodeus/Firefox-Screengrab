
screengrab.Browser = function(win) {
    this.win = win;
    this.doc = new screengrab.Document(win.document);
	this.htmlDoc = win.document;
	this.htmlWin = win.content.window;
}
screengrab.Browser.physicalDimensions = function() {
	return new screengrab.Box(window.screenX,
	                                 window.screenY,
									 window.outerWidth,
									 window.outerHeight);
}
screengrab.Browser.viewportAbsoluteDimensions = function() {
	var win = window.top.getBrowser().selectedBrowser;
	var browser = new screengrab.Browser(win.contentWindow);
    return new screengrab.Box(win.boxObject.screenX, win.boxObject.screenY,
	                           browser.getViewportWidth(), browser.getViewportHeight());
}
screengrab.Browser.contentFrame = function() {
	return document.commandDispatcher.focusedWindow;
}
screengrab.Browser.contentFrameDocument = function() {
	return screengrab.Browser.contentFrame().document;
}
screengrab.Browser.contentWindow = function() {
	return window.top.getBrowser().selectedBrowser.contentWindow;
}
screengrab.Browser.contentDocument = function() {
	return screengrab.Browser.contentWindow().document;
}
screengrab.Browser.frameDocumentFor = function(element) {
	return element.ownerDocument;
}
screengrab.Browser.frameFor = function(element) {
    return screengrab.Browser.frameDocumentFor(element).defaultView;
}
screengrab.Browser.prototype = {
    BGCOLOR : "#ffffff",
	
	getContentWindow : function() {
		return this.win;
	},
	
	getDocument : function() {
        return this.doc;
    },
    
	getCompletePageRegion : function() {
		var width = this.getDocumentWidth();
		var height = this.getDocumentHeight();
		if (this.getViewportWidth() > width) width = this.getViewportWidth();
		if (this.getViewportHeight() > height) height = this.getViewportHeight();
        
		return new screengrab.Box(0, 0, width, height);
	},
	
	getVisibleDocumentRegion : function() {
		return new screengrab.Box(this.htmlWin.scrollX, this.htmlWin.scrollY, this.getViewportWidth(), this.getViewportHeight());
	},

    getViewportRegion : function() {
        return new screengrab.Box(0, 0, this.getViewportWidth(), this.getViewportHeight());
    },
	
    getViewportHeight : function() {
        if (this.htmlDoc.compatMode == "CSS1Compat") {
            // standards mode
            return this.htmlDoc.documentElement.clientHeight;
        }
		// compatMode == "BackCompat") - quirks mode
        return this.htmlDoc.body.clientHeight;
    },
    
    getViewportWidth : function() {
        if (this.htmlDoc.compatMode == "CSS1Compat") {
            // standards mode
            return this.htmlDoc.documentElement.clientWidth;
        }
        // compatMode == "BackCompat") - quirks mode 
        return this.htmlDoc.body.clientWidth;
    },
	
	getDocumentHeight : function() {
        if (this.htmlDoc.compatMode == "CSS1Compat") {
            // standards mode
	        return this.htmlDoc.documentElement.scrollHeight;
        }
        return this.htmlDoc.body.scrollHeight;
    },
    
    getDocumentWidth : function() {
        if (this.htmlDoc.compatMode == "CSS1Compat") {
            // standards mode
            return this.htmlDoc.documentElement.scrollWidth;
        }
        return this.htmlDoc.body.scrollWidth;
    },
	
	getCanvas: function() {
		return document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
	},
	
	getFilledCanvas: function(region) {
		var canvas = this.getCanvas();
		this.copyRegionToCanvas(region, canvas);
		return canvas;
	},
	
    getAsDataUrl : function(region, format, params) {
        screengrab.debug("Copying " + region + " to dataUrl as " + format + ", " + params);
        var canvas = this.getFilledCanvas();
        return canvas.toDataURL(format, params);
    },
	
    copyRegionToCanvas : function(region, canvas) {
        var context = this.prepareCanvas(canvas, region);
        context.drawWindow(this.win, region.x, region.y, region.width, region.height, this.BGCOLOR);
        context.restore();
		return context;
    },
	
    prepareCanvas : function(canvas, region) {
        canvas.width = region.width;
        canvas.height = region.height;
        canvas.style.width = canvas.style.maxwidth = region.width + "px";
        canvas.style.height = canvas.style.maxheight = region.height + "px";
        
        var context = canvas.getContext("2d");
        context.clearRect(region.x, region.y, region.width, region.height);
        context.save();
        return context;
    }
}