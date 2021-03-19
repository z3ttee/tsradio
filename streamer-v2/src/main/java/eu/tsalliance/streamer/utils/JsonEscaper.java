package eu.tsalliance.streamer.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class JsonEscaper {
    private static final Logger logger = LoggerFactory.getLogger(JsonEscaper.class);

    private static JsonEscaper instance;
    private final HashMap<Character, String> chars = new HashMap<>();

    public JsonEscaper() {
        chars.put('"', "\"");
    }

    public String escape(String content) {
        return this.escape(content, null);
    }

    public String escape(String content, String fallback) {
        try {
            String escaped = content;

            if(content == null) {
                return fallback;
            }

            for (Map.Entry<Character, String> pair : chars.entrySet()) {
                escaped = escaped.replace(pair.getKey().toString(), pair.getValue());
            }

            return escaped;
        } catch (Exception ex) {
            return fallback;
        }
    }

    public static JsonEscaper getInstance() {
        if(instance == null) instance = new JsonEscaper();
        return instance;
    }
}
