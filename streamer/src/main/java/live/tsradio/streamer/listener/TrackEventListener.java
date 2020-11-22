package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.objects.AudioTrack;
import live.tsradio.streamer.objects.Channel;

public class TrackEventListener {

    public static final int REASON_EXCEPTION = 1;
    public static final int REASON_MAY_START_NEXT = 2;
    public static final int REASON_DONE = 3;

    public static void onTrackStart(Channel channel, AudioTrack track){
        String jsonData = "{ \"uuid\": \""+channel.getUuid()+"\", \"data\": { \"title\": \""+track.getTitle()+"\", \"artist\": \""+track.getArtist()+"\" }}";
        Redis.getInstance().publish(RedisChannels.CHANNEL_UPDATE_METADATA, jsonData);
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
                channel.reload();
                break;

            default:
                channel.logger.error("onTrackEnd(): A track has ended because of an exception: "+exception.getMessage());
                break;
        }
    }

}
