<?php

class FileAssemble 
{
    private $name;
    private $checksum;
    private $totalChunks;
    private $chunkList = array();
    private $storage;
    
    /**
     * Constructor
     * @param type $name
     * @param type $checksum
     * @param type $totalChunks 
     */
    public function __construct($name, $checksum, $totalChunks) {
        
        // Store the parameters
        $this->name = $name;
        $this->checksum = $checksum;
        $this->totalChunks = $totalChunks;
        
        // Setup the directory
        $this->storage = realpath('./') . '/' . $checksum . '/';
        
        // If the directory isn't there then create it
        if ( ! is_dir( $this->storage ) ) {
            mkdir($this->storage);
        }        
        // Load any previous data
        $this->loadExistingData();    
    }
    
    /**
     * Store a file chunk
     * @param type $id
     * @param type $data
     * @param type $checksum 
     */
    public function addChunk($id, $data, $checksum=null) {
        
        // Create the file
        $fileHandler = fopen($this->storage . $id . ".chk", 'w');
        
        // Write the data
        fwrite($fileHandler, $data);
        
        // Close the file
        fclose($fileHandler);
        
        // Register the chunk
        $this->registerChunk($id);
    }
    
    /**
     * Add the chunk to the internal list
     * @param type $id 
     */
    private function registerChunk($id)
    {
        // Create a checksum and
        //$this->chunkList[$id] = sha1_file($this->storage . $id . ".chk");
        $this->chunkList[$id] = $id;
        
        if ( count($this->chunkList) == $this->totalChunks ) {
            
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
        
        for ($i = 1; $i <= $this->totalChunks; $i++) {

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
    }
    
    /**
     * Get a list of missing chunks
     * @return int 
     */
    public function getMissing()
    {
        $missing = array();
        
        for( $i = 1; $i <= $this->totalChunks; $i++) {
            
            if( ! array_key_exists($i, $this->chunkList)) {
                
                $missing[] = $i;
            }
        }
        if ( count($missing) == 0 ) {
            
            $missing[] = 0;
        }
        
        return $missing;
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
                        
                        // Register the chunk
                        $this->registerChunk( $fileName[0] );
                    }
                }
            }
            
            // Close the directory
            closedir($handle);
        }
    }
}

?>
