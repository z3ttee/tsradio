package eu.tsalliance.streamer.utils;

import java.util.HashMap;
import java.util.Map;

public class JsonEscaper {
    private static JsonEscaper instance;
    private final HashMap<Character, String> chars = new HashMap<>();

    public JsonEscaper() {
        chars.put('"', "\"");
    }

    public String escape(String content) {
        String escaped = content;

        if(escaped == null) return "";
        for(Map.Entry<Character, String> pair : chars.entrySet()) {
            escaped = escaped.replace(pair.getKey().toString(), pair.getValue());
        }
        return escaped;
    }

    public static JsonEscaper getInstance() {
        if(instance == null) instance = new JsonEscaper();
        return instance;
    }
}
