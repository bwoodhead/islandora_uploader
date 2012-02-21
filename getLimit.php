<?php

// Get all the limits
$maxUploadSize = (int)(ini_get('upload_max_filesize'));
$maxPostSize = (int)(ini_get('post_max_size'));
$memoryLimit = (int)(ini_get('memory_limit'));

// Get the lowest limit
$maxAllowedUpload = min($maxUploadSize, $maxPostSize, $memoryLimit);

// Echo the results
echo($maxAllowedUpload);

?>
