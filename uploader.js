/**
 * Hashmap implementation for the file list
 */
function Map()
{
    // members
    this.keyArray = new Array(); // Keys
    this.valArray = new Array(); // Values

    // methods
    this.put = put;
    this.get = get;
    this.size = size;  
    this.clear = clear;
    this.keySet = keySet;
    this.valSet = valSet;
    this.showMe = showMe;  
    this.findIt = findIt;
    this.remove = remove;
}

function put( key, val )
{
    var elementIndex = this.findIt( key );

    if( elementIndex == (-1) )
    {
        this.keyArray.push( key );
        this.valArray.push( val );
    }
    else
    {
        this.valArray[ elementIndex ] = val;
    }
}

function get( key )
{
    var result = null;
    var elementIndex = this.findIt( key );

    if( elementIndex != (-1) )
    {   
        result = this.valArray[ elementIndex ];
    }  

    return result;
}

function remove( key )
{
    var result = null;
    var elementIndex = this.findIt( key );

    if( elementIndex != (-1) )
    {
        this.keyArray = this.keyArray.removeAt(elementIndex);
        this.valArray = this.valArray.removeAt(elementIndex);
    }  

    return ;
}

function size()
{
    return (this.keyArray.length);  
}

function clear()
{
    for( var i = 0; i < this.keyArray.length; i++ )
    {
        this.keyArray.pop();
        this.valArray.pop();   
    }
}

function keySet()
{
    return (this.keyArray);
}

function valSet()
{
    return (this.valArray);   
}

function showMe()
{
    var result = "";

    for( var i = 0; i < this.keyArray.length; i++ )
    {
        result += "Key: " + this.keyArray[ i ] + "\tValues: " + this.valArray[ i ] + "\n";
    }
    return result;
}

function findIt( key )
{
    var result = (-1);

    for( var i = 0; i < this.keyArray.length; i++ )
    {
        if( this.keyArray[ i ] == key )
        {
            result = i;
            break;
        }
    }
    return result;
}

function removeAt( index )
{
    var part1 = this.slice( 0, index);
    var part2 = this.slice( index+1 );

    return( part1.concat( part2 ) );
}
Array.prototype.removeAt = removeAt;

// Create a global file list and lock :(
uploaderFileList = new Map();
uploaderUploading = false;

/**
 * Wrap code that uses jquery into a function
 */
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

            // Tell the user what we are doing
            $('#uploadermessage').text("Checking for browser support.");
            
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
            // Tell the user what we are doing
            $('#uploadermessage').text("Getting the server limits.");
            
            // Get the limit from the server
            $.getJSON("islandora_uploader/get_limit",
                function(data) {
                    
                    // Hide the message
                    $("#uploadermessagearea").hide();
                    
                    // Create a global variable 
                    maxUploadSize = data['body']['maxupload'];

                    // Show the upload option
                    $("#uploaderform").show();

                    // Add a listener to the files
                    $("#uploaderfiles").change(Uploader.addFileToQueue);
                }
            );    
        }
    }

    var Uploader = {
        
        /**
         * Add a file to a queue to be uploaded
         */
        addFileToQueue : function (evt) {
            
            var files = evt.target.files;
            for (var i = 0, f; f = files[i]; i++) {

                // Create a key to index the file
                var key = Uploader.fileKey(f);
                
                // Check to see if we already have this file
                if ( uploaderFileList.get(key) != null ) {
                    continue;
                }
                
                uploaderFileList.put(key, f);
                $("#filelist").find('tbody').append(
                    $('<tr>').append(
                        $('<td>').text(f.fileName)
                        ).append(
                        $('<td>')
                        .attr('id',key)
                        .text('pending')
                        )
                    );
            }
            // Start the uploader
            Uploader.uploadFile();
        },

        /**
         * Handles walking through the queue and starts uploading each file
         */
        uploadFile : function () {
            
            var file = null;
            if ( uploaderUploading == true) {
                return;
            }
            uploaderUploading = true;
            
            // Get all the checksum keys
            var keys = uploaderFileList.keySet();
            
            // Loop through all the keys looking for one that needs to be uploaded
            for (var i = 0; i < keys.length; i++ ) {
                
                // Has it already been uploaded
                if ( uploaderFileList.get(keys[i]) != 1)
                {
                    // Keep the file
                    file = uploaderFileList.get(keys[i]);
                    
                    // Found a file so leave
                    break;
                }
            }
            // Did we complete all the uploads
            if ( file == null ) {
                uploaderUploading = false;
                return;
            }
            
            // Create a global variable 
            json = new Object();
            json['header'] = new Object();
            json['header']['name'] = "uploadBlocks";
            json['header']['version'] = 1;
            json['body'] = new Object();

            // Block is 1/4 of the upload size
            blockSize = maxUploadSize/4;

            json['body']['filename'] = file.name;
            json['body']['filesize'] = file.size;
            json['body']['totalblocks'] = Math.ceil(file.size/blockSize); 

            // Upload the blockss
            Uploader.uploadBlocks(file, 1);
        }, 

        /**
        * Upload the file
        */
        uploadBlocks : function(file, currentBlock) {

            // Update the text
            $('#' + Uploader.fileKey(file)).text('Block: ' + currentBlock + '/' + json['body']['totalblocks']);

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
            json['body']['checksum'] = Uploader.fileKey(currentFile);

            // Create the file reader
            var reader = new FileReader();
            reader.onloadend = Uploader.readFileEnded;

            var chunk;
            
            // Get the blob
            if ('mozSlice' in currentFile) {
                chunk = currentFile.mozSlice(startOfBlock, endOfBlock);
            } else {
                chunk = currentFile.webkitSlice(startOfBlock, endOfBlock);
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

                // Post the json
                $.post("islandora_uploader/upload_block/", json['body'],
                    function(data) {

                        data = Drupal.parseJson(data);

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
            var key = Uploader.fileKey(file);
            $('#' + key).text('Upload Complete');
            uploaderUploading = false;
            uploaderFileList.put(key, "1");
            Uploader.uploadFile();
        },

        /**
         * Generate a file checksum
         */
        fileKey : function(file)
        {
            return Uploader.checksum(file.name + file.fileName + file.type + file.size + file.lastModifiedDate.toLocaleDateString() + maxUploadSize);
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
