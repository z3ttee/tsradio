<?php
if(!$request->isAuthenticated()){
    throw new InvalidAccessTokenException();
}

if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

$missingParams = array();
if(!isset($_GET["uuid"]) && !isset($_GET["name"])) {
    array_push($missingParams, "uuid|name");
}

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$channelUUID = isset($_GET["uuid"]) ? $_GET['uuid'] : "";
$channelName = isset($_GET["name"]) ? $_GET['name'] : "";

if(!empty($channelUUID)) {
    $query = $database->get("channels", array("id", "=", $channelUUID));
} else {
    if(!empty($channelName)) {
        $query = $database->get("channels", array("name", "=", $channelName));
    } else {
        throw new Exception("Unknown identifier found");
    }
}

if($query->count() == 0) {
    throw new NotFoundException();
}

$channel = $query->first();
if(is_null($channel)) {
    throw new NotFoundException();
}

$id = $channel->id;

$channelInfo = $database->get("info", array("id", "=", $id))->first();

$lastUpdateMillis = strtotime($channelInfo->lastUpdate)*1000;
$currentMillis = (int) microtime(true)*1000;
$differenceMillis = (int) ($currentMillis - $lastUpdateMillis);
$maxDifferenceAllowed = 1000*60*10; #Max 10 minutes before considered as INACTIVE channel
    
if($differenceMillis < $maxDifferenceAllowed) {
    $channel->isActive = true;
    $channel->info = get_object_vars($channelInfo);
} else {
    $channel->isActive = false;
}

$history = json_decode($channelInfo->history);
$channelInfo->history = $history;

unset($channel->playlistLoop);
unset($channel->playlistShuffle);
unset($channel->playlistID);
unset($channel->nodeID);

unset($channel->info["id"]);
unset($channel->info["lastUpdate"]);
    
$response['payload'] = get_object_vars($channel);