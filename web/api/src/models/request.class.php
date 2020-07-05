<?php
class Request {
    private $_apiVersion = 'v1', 
            $_endpoint = 'ping',
            $_method = 'GET',
            $_query = array(),
            $_methodFile = null,
            $_authenticated = false;

    public function __construct(string $method = '', array $queryURL, array $params = array()){
        if(!isset($queryURL[0])) throw new VersionRequiredException();
        if(!isset($queryURL[1])) $queryURL[1] = 'ping';

        $this->_apiVersion = $queryURL[0];
        $this->_method = $_SERVER['REQUEST_METHOD'];

        if(preg_match("/[v][^0-9]/", $this->_apiVersion)) {
            throw new VersionRequiredException();
        }

        if(count($queryURL) > 2) {
            $this->_endpoint = $queryURL[2];
            $this->_methodFile = APP_PATH.'/src/versions/'.$this->_apiVersion.'/'.strtolower($queryURL[1]).'/'.strtolower($this->_endpoint).'.method.php';
        } else {
            $this->_endpoint = $queryURL[1];
            $this->_methodFile = APP_PATH.'/src/versions/'.$this->_apiVersion.'/'.strtolower($this->_endpoint).'.method.php';
        }

        if(!file_exists($this->_methodFile)){
            throw new EndpointNotFoundException();
        }

        if(isset($_GET["access_token"])){
            $accessToken = $_GET["access_token"];
            // Include access token check

            
        }
    
        $this->_authenticated = true;
    }

    function getMethodFile(){
        return $this->_methodFile;
    }
    function getMethodType(){
        return $this->_method;
    }
    function isAuthenticated(){
        return $this->_authenticated;
    }
}