<?php


// Check for method
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET required.');
}

// Check for params
$missingParams = array();
$username = $_GET["username"] ?? null;
$password = $_GET["password"] ?? null;
//$remembered = $_GET["remembered"] ?? false;

if(!isset($username)) array_push($missingParams, "username");
if(!isset($password)) array_push($missingParams, "password");

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

// Escaping
$username = escape($username);
$password = escape($password);

// Check DB connection
$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$result = $database->get('tsr_members', array('name', '=', $username));
if($result->count() == 0) {
    throw new Exception('Wrong credentials');
}


var_dump($userData);
/*$userID = "";
$hash = random_bytes(64);
if($database->insert('tsr_sessions', array(
    'id' => $userID,
    'sessionHash' => $hash,
    'expirationDate' => 1000*60*60*24*7
))) {
    $response['payload']['token'] = $hash;
}*/
$response['payload']['received'] = $_GET;
?>