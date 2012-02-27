<?php

// Include requirements
require_once('messages.php');
require_once('fileAssemble.php');

// Check to see if the checksum has been submitted
if ( ! isset($_GET['checksum']) ) {
    die("Missing checksum");
}

// Check to see if any data was sent
if ( !isset($_POST['header']) ) {
    die("Missing data");
}

// Get the sent checksum
$fileId = $_GET['checksum']; 

// Create a message object out of the json
$json = new ReceiveMessage($_POST);
    
// Create the file assemble class
$fileUploader = new FileAssemble($json->filename, $fileId, $json->totalblocks);

// Add the data
$fileUploader->addBlock($json->index, $json->block);

// Create a response
$resultMessage = new SendMessage("uploadBlockResults", 1);

// Tell the client what blocks are missing
$missingList = $fileUploader->getMissing();

// Get the first element in the list
$resultMessage->missing = $missingList[0];

// Echo the results
echo ($resultMessage);

?>
