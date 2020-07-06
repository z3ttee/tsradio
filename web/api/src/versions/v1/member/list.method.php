<?php
// Check for method
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET required.');
}

// Check DB connection
$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$result = $database->get('members', array(), array("id", "name", "permissionGroup", "creation"));
if($result->count() == 0) {
    throw new NotFoundException('No entries found');
}

$response["payload"] = $result->results();
?>