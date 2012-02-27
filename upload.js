jQuery(document).ready(function() 
{
    // Check for browser support
    checkBrowserSupport();
    
});

/**
 * Check to see if the broswer supports the file api
 */
function checkBrowserSupport() {
    
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Get the limits
        checkServerLimits();
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

/**
 * Get the server upload and memory limits
 */
function checkServerLimits()
{
    $.getJSON("http://127.0.0.1/islandora_uploader/getlimit",
        function(data) {
            // Create a global variable 
            maxUploadSize = data['body']['maxupload'];
            
            // Show the upload option
            $("#form").show();
            
            // Add a listener to the files
            $("#files").change(uploadFile);
        }
    );    
}

function uploadFile(evt) 
{
    //$("#list").append('<ul> uploadFile </ul>');
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
        uploadBlocks(f, 1);
    }
}

/**
 * Upload the file
 */
function uploadBlocks(file, currentBlock) {
    
    //$("#list").append('<ul> uploadBlocks ' + currentBlock + '</ul>');
    $("#list").text('Block: ' + currentBlock + '/' + json['body']['totalblocks']);

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
    hash = checksum(currentFile.name + currentFile.type + currentFile.size + currentFile.lastModifiedDate.toLocaleDateString());
    
    // Create the file reader
    var reader = new FileReader();
    reader.onloadend = readFileEnded;

    // Get the blob
    if ('mozSlice' in currentFile) {
        var chunk = currentFile.mozSlice(startOfBlock, endOfBlock);
    } else {
        var chunk = currentFile.webkitSlice(startOfBlock, endOfBlock);
    }

    // Read the binary string
    reader.readAsBinaryString(chunk);
 }


/**
 * File read complete handler
 */
function readFileEnded(evt) {

    if (evt.target.readyState == FileReader.DONE) { 

        var block = evt.target.result;
        // Add the data to the call
        json['body']['block'] = Base64.encode(block);
        //json['body']['block'] = block;

        // Post the json
        $.post("http://127.0.0.1/islandora_uploader/uploadblock/" + hash, json,
            function(data) {

                // Parse the JSON response
                data = jQuery.parseJSON(data);
                
                // Check to see if we are missing some blocks
                if ( data["body"]["missing"] == 0 )
                {
                    // upload complete callback
                    uploadComplete(currentFile);
                    return;
                }

                // Upload the next block
                uploadBlocks(currentFile, data['body']['missing']);
            }
        );
    }
}

/**
 * Create a simple checksum
 */
function checksum(s)
{
  var i;
  var chk = 0x12345678;

  for (i = 0; i < s.length; i++) {
    chk += (s.charCodeAt(i) * i);
  }

  return chk;
}

/**
 * Uploade complete callback
 */
function uploadComplete(file)
{
    $("#list").append('<ul>Upload Complete</ul>'); 
}