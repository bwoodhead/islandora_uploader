<?php

class BaseMessage 
{
    protected $values;
        
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
        
        // Check to see if its a header param
        if ( substr($name, 0, 1) == '_' ) {
            
            // Remove the _ from the name
            $name = substr($name, 1);
            
            // Check to make sure it isn't a reserved word
            if ($name == 'name' || $name == 'version') {
                
                // Toss an excption
                throw new Exception("Reserved name");
            }
            
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
class SendMessage extends BaseMessage
{
    /**
     * Create a message
     * @param type $requestName
     * @param type $version 
     */
    public function __construct($requestName, $version) 
    {
        // Create the areas
        $this->values = array();
        $this->values['header'] = array();
        $this->values['body'] = array();

        // Set the header
        $this->values['header']['name'] = $requestName;
        $this->values['header']['version'] = $version;
    }
}

class ReceiveMessage extends BaseMessage
{
    /**
     * Create a message from a json string
     * @param type $post 
     */
    public function __construct(&$post) 
    {
        $this->values['header'] = json_decode($post['header']);
        $this->values['body'] = json_decode($post['body']);
    }  
}


?>
