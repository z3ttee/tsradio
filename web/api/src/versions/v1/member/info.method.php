<?php
// Check for method
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET required.');
}

// Check for params
$missingParams = array();
$sessionHash = $_GET["session"] ?? null;
$uuid = $_GET["id"] ?? null;

if(!isset($sessionHash) && !isset($uuid)) array_push($missingParams, "session|uuid");

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

// Escaping
$sessionHash = escape($sessionHash);
$uuid = escape($uuid);

// Check DB connection
$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

// Get info
if(isset($sessionHash)) {
    $sessionResult = $database->get('sessions', array('sessionHash', '=', $sessionHash), array('id', 'expirationDate'));
    if($sessionResult->count() == 0) {
        throw new NotFoundException('Session not found');
    }
    $sessionResult = $sessionResult->first();

    $expiry = $sessionResult->expirationDate;
    $currentTimeMS = round(microtime(true) * 1000);

    if($expiry <= $currentTimeMS) {
        $database->delete('sessions', array('sessionHash', '=', $sessionHash));
        throw new Exception('Session expired');
    }

    $uuid = $sessionResult->id;
}

$result = $database->get('members', array('id', '=', $uuid), array('id', 'name', 'permissionGroup', 'creation'));
if($result->count() == 0) {
    throw new NotFoundException('User not found');
}

$user = $result->first();
$response['payload'] = $user;
?>