<?php
// Is request authenticated
if(!$request->isAuthenticated()){
    throw new InvalidAccessTokenException();
}

// Is methodType correct
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

// Check for missing params
$missingParams = array();
if(!isset($_GET["id"])) {
    array_push($missingParams, "id");
}

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

// Check for given fields to return
$fields = $_GET['fields'] ?? array();

if(gettype($fields) != 'array' && is_null(json_decode($fields)) && !empty($fields)) {
    $fields = explode(',', str_replace('[', '', str_replace(']', '', escape($fields))));
}

if(!isset($fields['id']) && !empty($fields)) {
    array_push($fields, 'id');
}

$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$uuid = isset($_GET["id"]) ? escape($_GET['id']) : "";

if(!empty($uuid)) {
    $query = $database->get("info", array("id", "=", $uuid), $fields);
} else {
    throw new Exception("Unknown identifier found");
}

if($query->count() == 0) {
    throw new NotFoundException();
}

$channel = $query->first();
if(is_null($channel)) {
    throw new NotFoundException();
}

$channel->history = (object) json_decode($channel->history);
$response['payload'] = get_object_vars($channel);