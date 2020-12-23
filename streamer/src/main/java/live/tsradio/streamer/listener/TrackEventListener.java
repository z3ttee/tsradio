package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.database.consts.RedisLists;
import live.tsradio.streamer.handler.ChannelHandler;
import live.tsradio.streamer.objects.AudioTrack;
import live.tsradio.streamer.objects.Channel;

public class TrackEventListener {

    public static final int REASON_EXCEPTION = 1;
    public static final int REASON_MAY_START_NEXT = 2;
    public static final int REASON_DONE = 3;
    public static final int REASON_SHUTDOWN = 4;

    public static void onTrackStart(Channel channel, AudioTrack track){
        channel.getInfo().setTitle(track.getTitle());
        channel.getInfo().setArtist(track.getArtist());
        channel.extractArtworkToApi(track.getMp3Data());

        sendMetadataUpdate(channel, track);
        channel.logger.info("onTrackStart(): Now playing: \""+track.getTitle()+"\" - "+track.getArtist());
    }

    public static void onTrackEnd(Channel channel, AudioTrack track, int endReason, Exception exception){
        channel.getInfo().addToHistory(track);
        Redis.getInstance().setInMap(RedisLists.MAP_CHANNEL_HISTORY, channel.getUuid(), channel.getHistoryAsJSON());
        Redis.getInstance().publish(RedisChannels.CHANNEL_UPDATE_HISTORY, channel.getHistoryAsJSON());

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
                channel.logger.error("onTrackEnd(): The channel is being restarted in 10s...");
                try {
                    Thread.sleep(10000);
                    ChannelHandler.restartChannel(channel.getUuid());
                } catch (InterruptedException ignored) {}
                break;
        }
    }

    private static void sendMetadataUpdate(Channel channel, AudioTrack track) {
        String jsonData;

        if(track == null) {
            channel.getInfo().clear();
            channel.setActive(false);
            jsonData = channel.getMetadataAsJSON();
            Redis.getInstance().removeFromMap(RedisLists.MAP_CHANNEL_METADATA, channel.getUuid());
        } else {
            channel.setActive(true);
            jsonData = channel.getMetadataAsJSON();
            Redis.getInstance().setInMap(RedisLists.MAP_CHANNEL_METADATA, channel.getUuid(), jsonData);
        }

        Redis.getInstance().publish(RedisChannels.CHANNEL_UPDATE_METADATA, jsonData);
    }

}
