package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.channel.AudioTrack;

public interface TrackEventListener {

    int REASON_MAY_START_NEXT = 0;
    int REASON_DONE = 1;
    int REASON_SHUTDOWN = 2;

    /**
     * Fired when AudioTrack started playing
     * @param track AudioTrack
     */
    void onTrackStarted(AudioTrack track);

    /**
     * Fired when AudioTrack stopped playing
     * @param track AudioTrack
     * @param reason Reason constant
     */
    void onTrackEnded(AudioTrack track, int reason);

    /**
     * Fired when an exception occured when playing an AudioTrack
     * @param track AudioTrack where exception occured
     * @param exception Exception that was thrown
     */
    void onTrackException(AudioTrack track, Exception exception);

}
