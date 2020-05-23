<?php
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

$missingParams = array();
if(!isset($_GET["uuid"])) array_push($missingParams, "uuid");

if(!empty($missingParams)) {
    throw new MissingParamsException($missingParams);
}

$channelUUID = $_GET['uuid'];

$docRef = $database->collection("channelInfo")->document($channelUUID);
$doc = $docRef->snapshot();

if(!$doc->exists()){
    throw new NotFoundException("Channel not found");
}

$response['payload'] = $doc->data();