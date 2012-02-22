jQuery(document).ready(function() 
{
    checkBrowserSupport();
    getLimits();
    
    //document.getElementById('files').addEventListener('change', displayFileInfo, false); 
    $("#files").change(displayFileInfo);
});

/**
 * Check to see if the broswer supports the file api
 */
function checkBrowserSupport() {
    
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //alert('Supported');
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

/**
 * Get the server upload and memory limits
 */
function getLimits()
{
//    var xhr = new XMLHttpRequest();
//    xhr.open('GET', 'http://127.0.0.1/islandora_uploader/getlimit', true);
//    xhr.responseType = 'text';

//    xhr.onload = function(e) {
//        if (this.status == 200) {
//            //document.getElementById('list').innerHTML = '<ul>' + xhr.responseText + '</ul>';
//            $("#list").html('<ul>' + xhr.responseText + '</ul>');
//            return xhr.responseText;
//        }
//    };
    
//    xhr.send();    
    
    $.getJSON("http://127.0.0.1/islandora_uploader/getlimit",
        function(data) {
            console.log("my object: %o", data);
            $("#list").html('<ul>' + data['header']['name'] + '</ul>');
            $("#list").append('<ul>' + data['body']['maxupload'] + '</ul>');
            //$.each(data.items, function(i,item) {
            //    $("#list").append(data.items);
            //});
        }
    );    
}

/**
 * Event handler for file select that desplays file information
 */
function displayFileInfo(evt) {
    
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</li>');
    }
    
    //document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    $("#list").html('<ul>' + output.join('') + '</ul>');
}

/**
 * Post a chunk of data 
 */
function uploadChunk(blobOrFile) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/server', true);
  xhr.onload = function(e) {
    if (this.status == 200) {
        document.getElementById('list').innerHTML = '<ul>' + xhr.responseText + '</ul>';
        return xhr.responseText;
    }
  };
  xhr.send(blobOrFile);
}

/**
 * Upload the file
 */
function uploadFile(evt) {
    var files = evt.target.files[0]; // FileList object

    const BYTES_PER_CHUNK = 1024 * 1024; // 1MB chunk sizes.
    const SIZE = blob.size;

    var start = 0;
    var end = BYTES_PER_CHUNK;

    while(start < SIZE) {

        if ('mozSlice' in blob) {
            var chunk = blob.mozSlice(start, end);
        } else {
            var chunk = blob.webkitSlice(start, end);
        }

        uploadChunk(chunk);

        start = end;
        end = start + BYTES_PER_CHUNK;
    }
 }
 