
screengrab.Action = function() {}
screengrab.Action.prototype = {
	doAction: function(canvas) {
        screengrab.prefs.incGrabCount();
    }
}

screengrab.SaveAction = function() {}
screengrab.SaveAction.prototype = {
	doAction: function(canvas) {
        screengrab.prefs.incGrabCount();
        var msg = document.getElementById("screengrab-strings").getString("SaveAsMessage");
        var picker = new screengrab.ImageFilePicker(screengrab.prefs.defaultFileName() + "." + screengrab.prefs.format(), msg, screengrab.prefs.formatMimeType());
        var file = picker.getFile();
		var dataUrl = canvas.toDataURL(file.mimeType, screengrab.prefs.formatQuality(file.mimeType));
        file.saveDataUrl(dataUrl, true);
	}
}

screengrab.CopyAction = function() {}
screengrab.CopyAction.prototype = {
	doAction: function(canvas) {
        screengrab.prefs.incGrabCount();
        var dataUrl = canvas.toDataURL(screengrab.prefs.formatMimeType(), screengrab.prefs.formatQuality(screengrab.prefs.formatMimeType()));
		screengrab.Clipboard.putImgDataUrl(dataUrl, null);
    }
}

screengrab.NewTabAction = function() {}
screengrab.NewTabAction.prototype = {
	doAction: function(canvas) {
        screengrab.prefs.incGrabCount();
        var dataUrl = canvas.toDataURL(screengrab.prefs.formatMimeType(), screengrab.prefs.formatQuality(screengrab.prefs.formatMimeType()));
        gBrowser.addTab(dataUrl);
    }
}

screengrab.UploadScrnshotsAction = function(shotData) {
	this.shotData = shotData;
}
screengrab.UploadScrnshotsAction.prototype = {
    doAction: function(canvas) {
        screengrab.prefs.incGrabCount();
        try {
			var me = this;
//			this.shotData = new sg.ScrnShots.ShotData();
//		    this.shotData.description = "A description";
//		    this.shotData.tags = "tags what";
//		    this.shotData.sourceUri = "www.screengrab.org";
//		    this.shotData.uploadFilename = "screengrab.png";
//		    this.shotData.sourceUri = "www.screengrab.org";
			this.shotData.file = screengrab.File.newTempFile("temp", "image/png");
            this.shotData.file.saveDataUrlWithCallbackWhenDone(canvas.toDataURL("image/png", ""), function() {
				try {
					new sg.ScrnShots("user", "pass").upload(me.shotData); 
					//me.doUpload(shotData);
				} catch (error) {
					sg.error(error);
				}
			});
        } catch (error) {
            sg.error(error);
        }
    },
	
	doUpload: function(sgFile) {
		var boundStr = '---------------------------265001916915724';
        var boundary = '--' + boundStr;
        var req = new XMLHttpRequest();
        var bodyStart = 
            boundary + "\r\n" +
            'Content-Disposition: form-data; name="screenshot[description]"' + "\r\n" +
            "\r\n" +
            this.description + "\r\n" +
            boundary + "\r\n" +
            'Content-Disposition: form-data; name="screenshot[tag_list]"' + "\r\n" +
            "\r\n" +
            this.tags + "\r\n" +
            boundary + "\r\n" +
            'Content-Disposition: form-data; name="screenshot[source_url]"' + "\r\n" +
            "\r\n" +
            this.uri + "\r\n" +
            boundary + "\r\n" +
            'Content-Disposition: form-data; name="screenshot[uploaded_data]"; filename="' + this.filename + '"' + "\r\n" +
            'Content-Type: image/png' + "\r\n" +
            "\r\n";
        var bodyStartStream = new sg.File.StringInputStream(bodyStart, bodyStart.length);
        var fileStream = sgFile.getBufferedStream();
        var bodyEnd = 
            "\r\n" +
            boundary + "--";
        var bodyEndStream = new sg.File.StringInputStream(bodyEnd, bodyEnd.length);
        
        var multiplexed = new sg.File.MultiplexInputStream();
        multiplexed.appendStream(bodyStartStream);
        multiplexed.appendStream(fileStream);
        multiplexed.appendStream(bodyEndStream);
        var length = bodyStartStream.available() + fileStream.available() + bodyEndStream.available(); 
        req.open("POST", "http://www.scrnshots.com/screenshots.xml", true);
        req.setRequestHeader("Authorization", "Basic " + sg.Base64.encode("user:pass"));
        req.setRequestHeader("Content-type", "multipart/form-data; boundary=" + boundStr);
        req.setRequestHeader("Content-Length", length);
        req.setRequestHeader("Connection", "close");
		req.overrideMimeType('text/xml');
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
				var links = req.responseXML.getElementsByTagName('link');
				if (links.length != 1) {
					alert("Something went wrong...");
				} else {
	                gBrowser.selectedTab = gBrowser.addTab(links[0].childNodes[0].nodeValue);
				}
                sgFile.remove();
            }
        }
        req.send(multiplexed);
	}
}