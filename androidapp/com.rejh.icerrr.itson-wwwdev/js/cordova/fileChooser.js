
(function(){
	
	console.log("Load plugin: FileChooser");
		   
    var FileChooser = function() {

    };

    FileChooser.prototype.filePicker = function(success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'FileChooser', 'open', []);
    };
	
	try {
	window.fileChooser = new FileChooser();
	window.plugins = window.plugins || {};
	window.plugins.fileChooser = window.fileChooser;
	} catch(e) { console.error(" > FileChooser not loaded"); console.error(e); }
	
})(window.PhoneGap || window.Cordova || window.cordova);

/*
module.exports = {
    open: function (success, failure) {
        cordova.exec(success, failure, "FileChooser", "open", []);
    }
};
/**/
