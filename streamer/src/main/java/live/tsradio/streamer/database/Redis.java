package live.tsradio.streamer.database;

import live.tsradio.streamer.database.events.RedisEvent;
import live.tsradio.streamer.files.FileHandler;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;
import redis.clients.jedis.exceptions.JedisConnectionException;
import redis.clients.jedis.exceptions.JedisDataException;

public class Redis {
    private static final Logger logger = LoggerFactory.getLogger(Redis.class);
    private static Redis instance;

    private Jedis publishRedis;
    private Jedis subscribeRedis;
    private boolean isOperatable;

    public Redis(){
        JSONObject redis = (JSONObject) FileHandler.getInstance().getConfig().get("redis");
        String host = (String) redis.get("host");
        long port = (long) redis.get("port");
        String password = (String) redis.get("pass");

        try {
            this.publishRedis = new Jedis(host, (int) port);
            this.publishRedis.auth(password);

            this.subscribeRedis = new Jedis(host, (int) port);
            this.subscribeRedis.auth(password);

            this.isOperatable = true;
        } catch (Exception ex){
            this.isOperatable = false;

            if(ex instanceof JedisConnectionException || ex instanceof JedisDataException) {
                logger.error("Redis(): Connection to redis failed: "+ex.getMessage());
            } else {
                ex.printStackTrace();
            }
        }
    }

    public void publish(RedisChannels channel, String message){
        if(!this.isOperatable) return;
        this.publishRedis.publish(channel.getChannelName(), message);
    }

    public void on(RedisChannels channel, RedisEvent eventListener){
        if(!this.isOperatable) return;

        String channelName = channel.getChannelName();
        this.subscribeRedis.subscribe(new JedisPubSub() {
            @Override
            public void onMessage(String c, String message) {
                eventListener.onEvent(channelName, message);
            }
        }, channelName);
    }

    public static Redis getInstance() {
        if(instance == null) instance = new Redis();
        return instance;
    }
}
