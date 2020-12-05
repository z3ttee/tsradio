package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.database.consts.RedisLists;
import live.tsradio.streamer.objects.AudioTrack;
import live.tsradio.streamer.objects.Channel;

public class TrackEventListener {

    public static final int REASON_EXCEPTION = 1;
    public static final int REASON_MAY_START_NEXT = 2;
    public static final int REASON_DONE = 3;
    public static final int REASON_SHUTDOWN = 4;

    public static void onTrackStart(Channel channel, AudioTrack track){
        sendMetadataUpdate(channel, track);
        channel.logger.info("onTrackStart(): Now playing: \""+track.getTitle()+"\" - "+track.getArtist());
    }

    public static void onTrackEnd(Channel channel, AudioTrack track, int endReason, Exception exception){
        channel.getHistory().add(track);

        switch (endReason) {
            case REASON_MAY_START_NEXT:
                // Reload playlist during last song to avoid stream downtime because of loading times
                if(channel.getQueue().size() <= 1) {
                    channel.reload();
                }
                break;
            case REASON_DONE:
                sendMetadataUpdate(channel, null);
                channel.reload();
                break;
            case REASON_SHUTDOWN:
                sendMetadataUpdate(channel, null);
                break;

            default:
                sendMetadataUpdate(channel, null);
                channel.logger.error("onTrackEnd(): A track has ended because of an exception: "+exception.getMessage());
                break;
        }
    }

    private static void sendMetadataUpdate(Channel channel, AudioTrack track) {
        String jsonData;

        if(track == null) {
            jsonData = "{ \"uuid\": \""+channel.getUuid()+"\", \"data\": { \"info\": {}}}";
            Redis.getInstance().removeFromMap(RedisLists.SET_CHANNEL_INFOS, channel.getUuid());
        } else {
            jsonData = "{ \"uuid\": \""+channel.getUuid()+"\", \"data\": { \"info\": {\"title\": \""+track.getTitle()+"\", \"artist\": \""+track.getArtist()+"\" }}}";
            Redis.getInstance().setInMap(RedisLists.SET_CHANNEL_INFOS, channel.getUuid(), jsonData);
        }

        Redis.getInstance().publish(RedisChannels.CHANNEL_UPDATE_METADATA, jsonData);
    }

}
