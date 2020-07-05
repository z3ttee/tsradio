<?php
use Ramsey\Uuid\Uuid;

// Check for method
// TODO: Change when in production to post
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('POST required.');
}

// Check for params
$missingParams = array();
$username = $_GET["username"] ?? null;
$password = $_GET["password"] ?? null;
$permissionGroup = $_GET["group"] ?? null;

if(!isset($username)) array_push($missingParams, "username");
if(!isset($password)) array_push($missingParams, "password");

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

// Escaping
$username = escape($username);
$password = escape($password);
$permissionGroup = escape($permissionGroup);

// Check DB connection
$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$uuid = Uuid::uuid4()->toString();
$hashedPw = password_hash($password, PASSWORD_BCRYPT);

// Check if username exists
if($database->get('members', array("name", "=", $username))->count() > 0) {
    throw new Exception('Username already exists');
}

// Check if user has been created
if(!$database->insert('members', array(
    "id" => $uuid,
    "name" => $username,
    "password" => $hashedPw,
    "permissionGroup" => $permissionGroup
))) {
    throw new Exception('Could not create new user');
}

// Done
$response['payload'] = $uuid;
?>