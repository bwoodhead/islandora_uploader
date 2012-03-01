(function ($) {

    // Page has been loaded
    jQuery(document).ready(function() 
    {
        // Check for browser support
        Browser.checkBrowserSupport();
    
    });

    // Encode binary data for text transmision.
    var Base64 = {

        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

            }
            return output;
        }
    }

    var Browser = {

        /**
        * Check to see if the broswer supports the file api
        */
        checkBrowserSupport : function () {

            // Check for the various File API support.
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                // Get the limits
                Server.checkServerLimits();
            } else {
                alert('The File APIs are not fully supported in this browser.');
            }
        }
    }

    var Server = {

        /**
        * Get the server upload and memory limits
        */
        checkServerLimits : function() 
        {
            $.getJSON("islandora_uploader/get_limit",
                function(data) {
                    // Create a global variable 
                    maxUploadSize = data['body']['maxupload'];

                    // Show the upload option
                    $("#uploaderform").show();

                    // Add a listener to the files
                    $("#uploaderfiles").change(Uploader.uploadFile);
                }
            );    
        }
    }

    var Uploader = {

        uploadFile : function (evt) 
        {
            var files = evt.target.files;

            // Create a global variable 
            json = new Object();
            json['header'] = new Object();
            json['header']['name'] = "uploadBlocks";
            json['header']['version'] = 1;
            json['body'] = new Object();

            // Block is 1/4 of the upload size
            blockSize = maxUploadSize/4;

            // Loop through all the files
            for (var i = 0, f; f = files[i]; i++) {

                json['body']['filename'] = f.name;
                json['body']['filesize'] = f.size;
                json['body']['totalblocks'] = Math.ceil(f.size/blockSize); 

                // Upload the blockss
                Uploader.uploadBlocks(f, 1);
            }
        }, 

        /**
        * Upload the file
        */
        uploadBlocks : function(file, currentBlock) {

            $("#uploaderfilelist").text('Block: ' + currentBlock + '/' + json['body']['totalblocks']);

            // Store the file in a global
            currentFile = file;

            // Create a start chunk variable
            var startOfBlock = (currentBlock-1) * blockSize;
            var endOfBlock = startOfBlock + blockSize;

            // Have we finished
            if ( startOfBlock >= currentFile.size) {

                // Should check the status of the file
                return;
            }

            // Store the current block
            json['body']['index'] = currentBlock;

            // Create a checksum to make sure the file hasn't changed'
            json['body']['checksum'] = Uploader.checksum(currentFile.name + currentFile.type + currentFile.size + currentFile.lastModifiedDate.toLocaleDateString());

            // Create the file reader
            var reader = new FileReader();
            reader.onloadend = Uploader.readFileEnded;

            // Get the blob
            if ('mozSlice' in currentFile) {
                var chunk = currentFile.mozSlice(startOfBlock, endOfBlock);
            } else {
                var chunk = currentFile.webkitSlice(startOfBlock, endOfBlock);
            }

            // Read the binary string
            reader.readAsBinaryString(chunk);
        },

        /**
        * File read complete handler
        */
        readFileEnded : function(evt) {

            if (evt.target.readyState == FileReader.DONE) { 

                var block = evt.target.result;
                
                // Add the data to the call
                json['body']['block'] = Base64.encode(block);

                //$("#uploaderfilelist").append("<br>"+json['body']['filename'] + " " + json['body']['totalblocks'] +"<BR>");
                
                // Post the json
                $.post("islandora_uploader/upload_block/", json['body'],
                    function(data) {
                        //$("#uploaderfilelist").append("<br>*******************************<br>Server Response: <br>" + data);
                        //console.log(data);
                        //return;
                        
                        // Parse the JSON response
                        //data = jQuery.parseJSON(data);
                        data = Drupal.parseJson(data);
                        
                        //$("#uploaderfilelist").append("<br>*******************************<br>Missing: <br>" + data['body']['missing']);
                        
                        //console.log(data);

                        // Check to see if we are missing some blocks
                        if ( data['body']['missing'] == 0 )
                        {
                            // upload complete callback
                            Uploader.uploadComplete(currentFile);
                            return;
                        }

                        // Upload the next block
                        Uploader.uploadBlocks(currentFile, data['body']['missing']);
                    }
                );
            }
        },

        /**
        * Uploade complete callback
        */
        uploadComplete : function (file)
        {
            $("#uploaderfilelist").append('<ul>Upload Complete</ul>'); 
        },

        /**
        * Create a simple checksum
        */
        checksum : function(s)
        {
        var i;
        var chk = 0x12345678;

        for (i = 0; i < s.length; i++) {
            chk += (s.charCodeAt(i) * i);
        }

        return chk;
        }

    }
})(jQuery);
