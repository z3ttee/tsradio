<?php
if(!$request->isAuthenticated()){
    throw new InvalidAccessTokenException();
}

if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

$missingParams = array();
if(!isset($_GET["uuid"])) array_push($missingParams, "uuid");

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

$channelUUID = $_GET['uuid'];

$docRef = $database->collection('channels')->document($channelUUID);
$document = $docRef->snapshot();

if(!$document->exists()){
    throw new NotFoundException("Channel not found");
}

$docData = $document->data();
$uuid = $docData["channelUUID"];

$channelActivity = $database->collection('channelInfo')->document($uuid)->snapshot();
$isChannelActive = $channelActivity->exists();

$channel = array(
    "channelUUID" => $uuid,
    "channelName" => $docData["channelName"],
    "creator" => $docData["creator"],
    "description" => $docData["description"],
    "mountpoint" => $docData["mountpoint"],
    "genres" => $docData["genres"],
    "isActive" => $isChannelActive,
);
if($isChannelActive) {
    $channel["activity"] = $channelActivity->data();
}

$response['payload'] = $channel;