<?php

require_once('messages.php');

// Create a message
$message = new SendMessage('getlimit', 1);

$message->uploadsize = (int)(ini_get('upload_max_filesize')) * 1024;
$message->postsize = (int)(ini_get('post_max_size')) * 1024;
$message->memorylimit = (int)(ini_get('memory_limit')) * 1024;

$message->maxupload = min($message->uploadsize, $message->postsize, $message->memorylimit);

// Echo the results
echo($message);

?>
