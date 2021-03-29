package eu.tsalliance.streamer.database;

import eu.tsalliance.streamer.files.FileHandler;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;

public class MySQL {
    private static final Logger logger = LoggerFactory.getLogger(MySQL.class);

    public static final String PREFIX = (String) ((JSONObject) FileHandler.getInstance().getConfig().get("mysql")).get("prefix");
    public static final String TABLE_CHANNELS = PREFIX + "channels";

    private static Connection connection;

    private static void connect() {
        JSONObject mysqlConfig = (JSONObject) FileHandler.getInstance().getConfig().get("mysql");
        String host = (String) mysqlConfig.get("host");
        long port = (long) mysqlConfig.get("port");
        String database = (String) mysqlConfig.get("database");
        String user = (String) mysqlConfig.get("user");
        String password = (String) mysqlConfig.get("pass");

        try {
            logger.info("Connecting to mysql database...");

            connection = DriverManager.getConnection("jdbc:mysql://"+host+":"+port+"/"+database+"?autoReconnect=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Europe/Berlin", user, password);
            logger.info("Connected to mysql database '"+user+"'@'"+host+":"+port+"'");
        } catch (Exception ex) {
            if(ex instanceof SQLNonTransientConnectionException) {
                logger.error(ex.getMessage());
            } else {
                logger.error("Could not connect to mysql database '"+user+"'@'"+host+":"+port+"'");
            }
        }
    }

    private static boolean hasConnection() {
        try {
            return connection != null && !connection.isClosed();
        } catch (SQLException throwable) {
            throwable.printStackTrace();
            return false;
        }
    }

    public static ResultSet query(String query) {
        if(!hasConnection()) {
            connect();
        }

        try {
            PreparedStatement pps = connection.prepareStatement(query);

            ResultSet rs = pps.executeQuery();
            if(rs.next()) {
                return rs;
            } else {
                return null;
            }
        } catch (Exception ignored) {
            logger.error("Could not send mysql query, because there was an exception");
            return null;
        }
    }

    public static ResultSet get(String tableName, String where, ArrayList<String> attributes){
        if(!hasConnection()) {
            connect();
        }

        String attrs = attributes.isEmpty() ? "*" : String.join(",",attributes);
        String whereClause = where != null ? "WHERE "+where : "";

        return query("SELECT "+attrs+" FROM `" + tableName + "` " + whereClause + ";");
    }
}
