package live.tsradio.streamer.repositories;

import live.tsradio.streamer.database.MySQL;
import live.tsradio.streamer.objects.Channel;
import live.tsradio.streamer.objects.ChannelInfo;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;

public class ChannelRepository extends Repository<Channel> {

    @Override
    public ArrayList<Channel> findAll() {
        ArrayList<Channel> channels = new ArrayList<>();
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, "enabled = TRUE", new ArrayList<>(Arrays.asList("title", "uuid", "path", "description", "featured")));

        try {
            do {
                Channel channel = new Channel(rs.getString("uuid"), rs.getString("title"), rs.getString("path"), rs.getString("description"), rs.getBoolean("featured"), new ChannelInfo());
                channels.add(channel);
            } while (rs.next());
        } catch (Exception ignored) { }
        return channels;
    }

    @Override
    public Channel findOneByID(String uuid) {
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, "uuid = '"+uuid+"' AND enabled = TRUE", new ArrayList<>(Arrays.asList("title", "uuid", "path", "description", "featured")));

        try {
            return new Channel(rs.getString("uuid"), rs.getString("title"), rs.getString("path"), rs.getString("description"), rs.getBoolean("featured"), new ChannelInfo());
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }


}
