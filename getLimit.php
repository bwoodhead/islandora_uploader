<?php

$limitsArray = array();
$limitsArray['header'] = array();
$limitsArray['header']['request'] = 'getlimit';

// Get all the limits
$limitsArray['body'] = array();
$limitsArray['body']['uploadsize'] = (int)(ini_get('upload_max_filesize'));
$limitsArray['body']['postsize'] = (int)(ini_get('post_max_size'));
$limitsArray['body']['memorylimit'] = (int)(ini_get('memory_limit'));

// Get the lowest limit
$limitsArray['body']['maxupload'] = min($limitsArray['body']['uploadsize'], $limitsArray['body']['postsize'], $limitsArray['body']['memorylimit']);

// Echo the results
echo(json_encode($limitsArray));

?>
