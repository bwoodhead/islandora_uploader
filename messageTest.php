<?php

require_once('message.php');

// Create a message
$message = new message('test', 1);

// Add some header params
$message->_newparam1 = 1;
$message->_newparam2 = 2;
$message->_newparam3 = 3;

// Add some values to the body
$message->value1 = 1;
$message->value2 = 2;
$message->value3 = 3;
$message->value4 = 4;

echo $message;

?>
