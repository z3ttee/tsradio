package live.tsradio.streamer.repositories;

import java.util.HashMap;

public abstract class Repository<T> {

    public abstract HashMap<String, T> findAll();
    public abstract T findOneByID(String uuid);

}
