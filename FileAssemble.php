<?php

class FileAssemble 
{
    private $name;
    private $checksum;
    private $totalBlocks;
    private $blockList = array();
    private $storage;
    private $completed = false;
    
    /**
     * Constructor
     * @param type $name
     * @param type $checksum
     * @param type $totalChunks 
     */
    public function __construct($name, $checksum, $totalBlocks) {
        
        // Store the parameters
        $this->name = $name;
        $this->checksum = $checksum;
        $this->totalBlocks = $totalBlocks;
        
        // Setup the directory
        $this->storage = file_directory_temp() . '/' . $checksum . '/';
        
        // If the directory isn't there then create it
        if ( ! is_dir( $this->storage ) ) {
            mkdir($this->storage);
        }        
        // Load any previous data
        $this->loadExistingData(); 
        
        //echo( "Name: " . $this->name . " Checksum: " . $this->checksum . " TotalBlocks " . $this->totalBlocks . "<BR>");
    }
    
    /**
     * Store a file block
     * @param type $id
     * @param type $data
     * @param type $checksum 
     */
    public function addBlock($id, $data, $checksum=null) {
        
        //echo( "Add block - Id: " . $id . " data: " . $data. "<BR>");

        // Create the file
        $fileHandler = fopen($this->storage . $id . ".chk", 'w');
        
        // Write the data
        fwrite($fileHandler, $data);
        
        // Close the file
        fclose($fileHandler);
        
        // Register the block
        $this->registerBlock($id);
    }
    
    /**
     * Add the block to the internal list
     * @param type $id 
     */
    private function registerBlock($id)
    {
        // Create a checksum and
        //$this->chunkList[$id] = sha1_file($this->storage . $id . ".chk");
        $this->blockList[$id] = $id;
        
        if ( count($this->blockList) == $this->totalBlocks ) {
            
            $this->assembleFile();
        }
    }
    
    /**
     * Assemble the file now that its complete 
     */
    private function assembleFile()
    {
        // Create the file
        $fileHandler = fopen($this->storage . $this->name, 'w');
        
        for ($i = 1; $i <= $this->totalBlocks; $i++) {

            // Store the full path of a file
            $filename = $this->storage . $i . ".chk";
            
            // Open the block
            $blockHandler = fopen($filename, 'r');
            
            // Read the full contents
            $block = fread($blockHandler, filesize($filename));
            
            // Close the block
            fclose($blockHandler);

            // Write the data
            fwrite($fileHandler, base64_decode($block));
        }
        
        // Close the file
        fclose($fileHandler);   
        
        // Flag the file completed
        $this->completed = true;
    }
    
    /**
     * Get a list of missing blocks
     * @return int 
     */
    public function getMissing()
    {
        $missing = array();
        
        for( $i = 1; $i <= $this->totalBlocks; $i++) {
            
            if( ! array_key_exists($i, $this->blockList)) {
                
                $missing[] = $i;
            }
        }
        if ( count($missing) == 0 ) {
            
            $missing[] = 0;
        }
        
        return $missing;
    }
    
    
    /**
     * Get the file
     * @return null 
     */
    public function getFileURI()
    {
        if ( ! $this->completed )
        {
            return null;
        }
        return file_directory_temp() . '/' . $checksum . '/' . $this->name;
    }
    
    /**
     * Load any existing data 
     */
    private function loadExistingData()
    {
        // Open the directory
        if ($handle = opendir($this->storage) ) {
            
            // Loop through the files
            while (false !== ($entry = readdir($handle))) {
                
                // Skip the extra files
                if ($entry != "." && $entry != "..") {
                    
                    // Split the file name on the dot
                    $fileName = explode(".", $entry);
                    
                    // Check the file extension
                    if ( strcmp(end($fileName), "chk") == 0 ) {
                        
                        // Register the block
                        $this->registerBlock( $fileName[0] );
                    }
                }
            }
            
            // Close the directory
            closedir($handle);
        }
    }
}

?>
