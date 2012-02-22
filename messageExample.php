<?php

require_once('messages.php');

// Create a message
$message = new SendMessage('test', 1);

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
// OUTPUT 
// {"header":{"name":"test","version":1,"newparam1":1,"newparam2":2,"newparam3":3},"body":{"value1":1,"value2":2,"value3":3,"value4":4}}

?>
