<?php

require_once('messages.php');

if (isset($_GET['checksum']) )
{
    $fileId = $_GET['checksum']; 
}

// Get the post data
if (isset($_POST['data']) )
{
    // Get the post data and create message
    $json = $_POST['data'];
    $jsonchunk = new ReceiveMessage($json);
    
} else {

    // Create fake messages
    $jsonchunk = new SendMessage("fakeData", 1);
}

$resultMessage = new SendMessage("uploadChunkResults", 1);

echo("************************************<br>");
echo("Checksum: " . $fileId . "<br>");
echo("************************************<br>");

echo("Received: " . $jsonchunk . "<br>");
echo("************************************<br>");

echo("Results: " . $resultMessage ."<br>");
echo("************************************<br>");

?>
