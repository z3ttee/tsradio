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
    $channel->isActive = false;

    $activity = $database->get("info", array("id", "=", $id));
    if($activity->count() != 0) {
        $channelInfo = $activity->first();

        $lastUpdateMillis = strtotime($channelInfo->lastUpdate)*1000;
        $currentMillis = (int) microtime(true)*1000;
        $differenceMillis = (int) ($currentMillis - $lastUpdateMillis);
        $maxDifferenceAllowed = 1000*60*10; #Max 10 minutes before considered as INACTIVE channel
        
        if($differenceMillis < $maxDifferenceAllowed) {
            $channel->isActive = true;
            $channel->info = get_object_vars($channelInfo);
        }

        $history = json_decode($channelInfo->history);
        $channelInfo->history = $history;

        unset($channel->info["id"]);
        unset($channel->info["lastUpdate"]);
    }

    $channel->featured = boolval($channel->featured);
    $channel->listed = boolval($channel->listed);

    unset($channel->playlistLoop);
    unset($channel->playlistShuffle);
    unset($channel->playlistID);
    unset($channel->nodeID);
    
    $channelList[$channel->id] = get_object_vars($channel);
}

$response['payload'] = $channelList;