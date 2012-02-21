<?php

class message 
{
    private $values = array();
    
    /**
     * Create a message
     * @param type $requestName
     * @param type $version 
     */
    public function __construct($requestName, $version) 
    {
        // Create the areas
        $this->values['header'] = array();
        $this->values['body'] = array();

        // Set the header
        $this->values['header']['request'] = $requestName;
        $this->values['header']['version'] = $version;
    }
    
    /**
     * Get a header or body parameter
     * Header params start with _
     * @param type $name
     * @return type 
     */
    public function __get($name) {

        // Check to see if its a header param
        if ( substr($name, 0, 1) == '_' ) {
            
            // Remove the _ from the name
            $name = substr($name, 1);
            
            // Check to make sure it isn't a reserved word
            if ($name == 'request' || $name == 'version') {
                
                // Toss an excption
                throw new Exception("Reserved name");
            }
            
            // Return the header value
            return $this->values['header'][$name];
        }
        
        // Return the body value
        return $this->values['body'][$name];
    }
    
    /**
     * Set the header or body paramters
     * Header params start with _
     * @param type $name
     * @param type $value 
     */
    public function __set($name, $value) {
        
        echo( $name . " " . $value ."<br>");
        
        // Check to see if its a header param
        if ( substr($name, 0, 1) == '_' ) {
            
            // Remove the _ from the name
            $name = substr($name, 1);
            
            // Check to make sure it isn't a reserved word
            if ($name == 'request' || $name == 'version') {
                
                // Toss an excption
                throw new Exception("Reserved name");
            }
            echo( $name ."<br>" );
            
            // Return the header value
            $this->values['header'][$name] = $value;
            
            // Leave the call
            return;
        }
        
        // Return the body value
        $this->values['body'][$name] = $value;     
    }
    
    /** 
     * Return the encoded string
     * @return type
     */
    public function __toString() {
        
        // Return the json encoded string
        return json_encode($this->values);
    }
}

?>
