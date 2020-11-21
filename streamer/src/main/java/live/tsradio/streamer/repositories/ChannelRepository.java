package live.tsradio.streamer.repositories;

import live.tsradio.streamer.database.MySQL;
import live.tsradio.streamer.objects.Channel;
import live.tsradio.streamer.objects.Playlist;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;

public class ChannelRepository extends Repository<Channel> {

    @Override
    public ArrayList<Channel> findAll() {
        ArrayList<Channel> channels = new ArrayList<>();
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, "enabled = TRUE", new ArrayList<>(Arrays.asList("playlistUUID", "title", "uuid", "path")));

        try {
            do {
                PlaylistRepository repository = new PlaylistRepository();
                Playlist playlist = repository.findOneByID(rs.getString("playlistUUID"));

                Channel channel = new Channel(rs.getString("uuid"), rs.getString("title"), rs.getString("path"), playlist);
                channels.add(channel);
            } while (rs.next());
        } catch (Exception ignored) { }
        return channels;
    }

    @Override
    public Channel findOneByID(String uuid) {
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_CHANNELS, "uuid = '"+uuid+"' AND enabled = TRUE", new ArrayList<>(Arrays.asList("playlistUUID", "title", "uuid", "path")));

        try {
            PlaylistRepository repository = new PlaylistRepository();
            Playlist playlist = repository.findOneByID(rs.getString("playlistUUID"));

            return new Channel(rs.getString("uuid"), rs.getString("title"), rs.getString("path"), playlist);
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }


}
