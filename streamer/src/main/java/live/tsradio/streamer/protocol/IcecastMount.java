package live.tsradio.streamer.protocol;

import lombok.Getter;
import lombok.Setter;

public class IcecastMount {

    @Getter @Setter private String name;
    @Getter @Setter private String path;

    public IcecastMount(String name, String path) {
        this.name = name;
        this.path = path;
    }
}
