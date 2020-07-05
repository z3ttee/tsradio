<?php


// Check for method
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET required.');
}

// Check for params
$missingParams = array();
$username = $_GET["username"] ?? null;
$password = $_GET["password"] ?? null;

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

$result = $database->get('members', array('name', '=', $username), array('id', 'password'));
if($result->count() == 0) {
    throw new Exception('Wrong credentials');
}

$user = $result->first();

if(!password_verify($password, $user->password)) {
    throw new Exception('Wrong credentials');
}

$hash = bin2hex(random_bytes(64));
// Delete old session
if($database->get("sessions", array("id", "=", $user->id))->count() > 0) {
    $database->delete("sessions", array("id", "=", $user->id));
}
var_dump($database->errorInfo());

// Insert new session
$database->insert('sessions', array(
    'id' => $user->id,
    'sessionHash' => $hash,
    'expirationDate' => 1000*60*60*24*7
));

$response['payload']['token'] = $hash;
?>