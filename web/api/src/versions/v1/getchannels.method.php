<?php
if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

$docRef = $database->collection('channels');
$documents = $docRef->documents();

$channelList = array();


foreach ($documents as $document){
    if($document->exists()){
        $docData = $document->data();
        $uuid = $docData["channelUUID"];

        $channelActivity = $database->collection('channelInfo')->document($uuid)->snapshot();
        $isChannelActive = $channelActivity->exists();
        $channelList[$uuid] = array(
            "channelUUID" => $uuid,
            "channelName" => $docData["channelName"],
            "creator" => $docData["creator"],
            "description" => $docData["description"],
            "mountpoint" => $docData["mountpoint"],
            "genres" => $docData["genres"],
            "isActive" => $isChannelActive
        );

        if($isChannelActive) {
            $channelList[$uuid]["activity"] = $channelActivity->data();
        }
    }
}

$response['payload'] = $channelList;