package live.tsradio.streamer.repositories;

import java.util.ArrayList;

public abstract class Repository<T> {

    public abstract ArrayList<T> findAll();
    public abstract T findOneByID(String uuid);

}
