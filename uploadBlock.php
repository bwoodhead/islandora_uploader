<?php

require_once('messages.php');
require_once('FileAssemble.php');

if ( ! isset($_GET['checksum']) ) {
    die("Missing checksum");
}
if ( !isset($_POST['header']) ) {
    die("Missing data");
}

$fileId = $_GET['checksum']; 
$json = new ReceiveMessage($_POST);
    
// Create the file assemble class
$fileUploader = new FileAssemble($json->filename, $fileId, $json->totalblocks);

// Add the data
$fileUploader->addChunk($json->index, $json->block);

// Create a response
$resultMessage = new SendMessage("uploadChunkResults", 1);

// Tell the client what blocks are missing
$missingList = $fileUploader->getMissing();
$resultMessage->missing = $missingList[0];

// Echo the results
echo ($resultMessage);
/*
echo("************************************<br>");
echo("Checksum: " . $fileId . "<br>");
echo("************************************<br>");

echo("Received: " . $json . "<br>");
echo("************************************<br>");

echo("Results: " . $resultMessage ."<br>");
echo("************************************<br>");
*/

?>
