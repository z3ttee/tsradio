package live.tsradio.streamer.database;

import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.database.consts.RedisLists;
import live.tsradio.streamer.database.events.RedisEvent;
import live.tsradio.streamer.files.FileHandler;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.JedisPubSub;
import redis.clients.jedis.exceptions.JedisConnectionException;
import redis.clients.jedis.exceptions.JedisDataException;

public class Redis {
    private static final Logger logger = LoggerFactory.getLogger(Redis.class);

    private JedisPool jedisPool;
    private static Redis instance;

    public Redis(){
        JSONObject redis = (JSONObject) FileHandler.getInstance().getConfig().get("redis");
        String host = (String) redis.get("host");
        long port = (long) redis.get("port");
        String password = (String) redis.get("pass");

        try {
            JedisPoolConfig poolConfig = new JedisPoolConfig();
            poolConfig.setMaxTotal(100);
            this.jedisPool = new JedisPool(poolConfig, host, (int) port, 4000, password);
        } catch (Exception ex){
            if(ex instanceof JedisConnectionException || ex instanceof JedisDataException) {
                logger.error("Redis(): Connection to redis failed: "+ex.getMessage());
            } else {
                ex.printStackTrace();
            }
        }
    }

    public void publish(RedisChannels channel, String message){

        this.publish(channel.getChannelName(), message);
    }
    public void publish(String channel, String message){
        logger.info("publish(): "+channel+" "+message);

        try (Jedis jedis = this.jedisPool.getResource()) {
            jedis.publish(channel, message);
        } catch (Exception ex) {
            logger.error("publish(): Error occured: "+ex.getMessage());
        }
    }

    public void setInMap(RedisLists map, String field, String value) {
        try (Jedis jedis = this.jedisPool.getResource()) {
            jedis.hset(map.getListName(), field, value);
        } catch (Exception ex) {
            logger.error("setInMap(): Error occured: "+ex.getMessage());
        }
    }

    public void removeFromMap(RedisLists map, String field) {
        try (Jedis jedis = this.jedisPool.getResource()) {
            jedis.hdel(map.getListName(), field);
        } catch (Exception ex) {
            logger.error("removeFromMap(): Error occured: "+ex.getMessage());
        }
    }

    public void on(RedisChannels channel, RedisEvent eventListener){
        new Thread(() -> {
            String channelName = channel.getChannelName();

            try (Jedis jedis = this.jedisPool.getResource()) {
                jedis.subscribe(new JedisPubSub() {
                    @Override
                    public void onMessage(String c, String message) {
                        try {
                            eventListener.onEvent(channelName, message);
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }
                }, channelName);
            } catch (Exception ex) {
                logger.error("on(): Error occured: "+ex.getMessage());
            }
        }).start();
    }

    public static Redis getInstance() {
        if(instance == null) instance = new Redis();
        return instance;
    }
}
