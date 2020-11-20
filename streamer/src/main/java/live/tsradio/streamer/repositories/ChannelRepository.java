package live.tsradio.streamer.repositories;

import live.tsradio.streamer.database.MySQL;
import live.tsradio.streamer.objects.Channel;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;

public class ChannelRepository extends Repository<Channel> {

    @Override
    public ArrayList<Channel> findAll() {
        ArrayList<Channel> channels = new ArrayList<>();
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, null, new ArrayList<>(Arrays.asList("playlistUUID", "uuid", "enabled")));

        try {
            do {
                Channel channel = new Channel(rs.getString("uuid"), rs.getString("playlistUUID"), rs.getBoolean("enabled"));
                channels.add(channel);
            } while (rs.next());
        } catch (Exception ignored) { }
        return channels;
    }

    @Override
    public Channel findOneByID(String uuid) {
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, "uuid = '"+uuid+"'", new ArrayList<>(Arrays.asList("playlistUUID", "uuid", "enabled")));

        try {
            return new Channel(rs.getString("uuid"), rs.getString("playlistUUID"), rs.getBoolean("enabled"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }


}
