package live.tsradio.streamer.repositories;

import live.tsradio.streamer.database.MySQL;
import live.tsradio.streamer.objects.Playlist;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;

public class PlaylistRepository extends Repository<Playlist> {

    @Override
    public ArrayList<Playlist> findAll() {
        ArrayList<Playlist> playlists = new ArrayList<>();
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_PLAYISTS, null, new ArrayList<>(Arrays.asList("title", "uuid")));

        try {
            do {
                Playlist playlist = new Playlist(rs.getString("uuid"), rs.getString("title"));
                playlists.add(playlist);
            } while (rs.next());
        } catch (Exception ignored) { }

        return playlists;
    }

    @Override
    public Playlist findOneByID(String uuid) {
        ResultSet rs = MySQL.getInstance().get(MySQL.TABLE_PLAYISTS, "uuid = '"+uuid+"'", new ArrayList<>(Arrays.asList("title", "uuid")));

        try {
            return new Playlist(rs.getString("uuid"), rs.getString("title"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }


}
