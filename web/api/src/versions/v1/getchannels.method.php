<?php
if(!$request->isAuthenticated()){
    throw new InvalidAccessTokenException();
}

if($request->getMethodType() != 'GET') {
    throw new WrongMethodTypeException('GET');
}

$database = Database::getInstance();
if(!$database->hasConnection()){
    throw new Exception("No database connection");
}

$channels = $database->get("channels")->results();
$channelList = array();
foreach($channels as $channel) {
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
    
    $channelList[$channel->id] = get_object_vars($channel);
}

$response['payload'] = $channelList;