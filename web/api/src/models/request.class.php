<?php
class Request {
    private $_apiVersion = 'v1', 
            $_endpoint = 'ping',
            $_method = 'GET',
            $_query = array(),
            $_methodFile = null,
            $_authenticated = false;

    public function __construct(string $method = '', array $queryURL, array $params = array(), $database){
        if(!isset($queryURL[0])) throw new VersionRequiredException();
        if(!isset($queryURL[1])) $queryURL[1] = 'ping';

        $this->_apiVersion = $queryURL[0];

        if(preg_match("/[v][^0-9]/", $this->_apiVersion)) {
            throw new VersionRequiredException();
        }

        $this->_endpoint = $queryURL[1];
        $this->_methodFile = APP_PATH.'/src/versions/'.$this->_apiVersion.'/'.strtolower($this->_endpoint).'.method.php';

        if(!file_exists($this->_methodFile)){
            throw new EndpointNotFoundException();
        }

        if(isset($_GET["access_token"])){
            $accessToken = $_GET["access_token"];
            $docs = $database->collection("apiTokens")->where("token", "=", $accessToken)->where("type", "=", "access")->documents();

            foreach($docs as $doc) {
                $this->_authenticated = $doc->exists();
                break;
            }
        }
    
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