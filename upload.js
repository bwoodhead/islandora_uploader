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
            maxUploadSize = $("#list").append('<ul>' + data['body']['maxupload'] + '</ul>');
            
            // Show the upload option
            $("#form").show();
            
            // Add a listener to the files
            $("#files").change(uploadFile);
        }
    );    
}

function uploadFile(evt) 
{
    // Create a global variable 
    json = new Object();
    json['header'] = new Object();
    json['header']['name'] = "uploadBlocks";
    json['header']['version'] = 1;
    json['body'] = new Object();
    
    // Loop through all the files
    for (var i = 0, file; file = files[i]; i++) {
        
        // Upload the blockss
        uploadBlocks(file, 0);
    }
}

/**
 * Upload the file
 */
function uploadBlocks(file, currentBlock) {
    
    // Block is 1/4 of the upload size
    var blockSize = maxUploadSize/4;
 
    // Create a start chunk variable
    var startOfBlock = currentBlock*blockSize;
    var endOfBlock = startOfBlock + blockSize;

    // Have we finished
    if ( startOfBlock >= file.size) {
        
        // Should check the status of the file
        return;
    }

    // Get the blob
    if ('mozSlice' in blob) {
        var chunk = blob.mozSlice(startOfBlock, endOfBlock);
    } else {
        var chunk = blob.webkitSlice(startOfBlock, endOfBlock);
    }

    // Add the data to the call
    json['body']['index'] = currentBlock;
    json['body']['block'] = Base64.encode(chunk);

    // Create a checksum to make sure the file hasn't changed'
    hash = checksum(file.name + file.type + file.size + file.lastModifiedDate.toLocaleDateString());

    // Post the json
    $.post("http://127.0.0.1/islandora_uploader/uploadblock/" + hash, $json,
        function(data) {
            // Do something with the response

            // Upload the next block
            uploadBlocks(file, currentBlock+1);
    });
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