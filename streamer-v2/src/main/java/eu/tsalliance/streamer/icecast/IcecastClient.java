package eu.tsalliance.streamer.icecast;

import eu.tsalliance.streamer.channel.AudioTrack;
import eu.tsalliance.streamer.channel.Channel;
import eu.tsalliance.streamer.files.FileHandler;
import eu.tsalliance.streamer.listener.TrackEventListener;
import lombok.Getter;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import java.io.*;
import java.net.Socket;
import java.net.SocketException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class IcecastClient {

    private final Logger logger = LoggerFactory.getLogger(IcecastClient.class);

    @Getter private final Channel channel;
    @Getter private Socket sslSocket;
    @Getter private OutputStream stream;
    @Getter private final JSONObject icecastConfig = (JSONObject) FileHandler.getInstance().getConfig().get("icecast");

    public IcecastClient(Channel channel) {
        this.channel = channel;
    }

    /**
     * Check if the socket has a connection
     * @return True or False
     */
    public boolean isConnected() {
        return this.stream != null;
    }

    /**
     * Disconnect from icecast
     */
    public void disconnect() {
        try {
            this.stream.close();
        } catch (IOException ignored) {}
        this.stream = null;
    }

    /**
     * Connect to the icecast server
     */
    public void connect() {
        String host = (String) icecastConfig.get("host");
        long port = (long) icecastConfig.get("port");
        String sourceName = (String) icecastConfig.get("sourceName");
        String password = (String) icecastConfig.get("sourcePass");

        try {
            // Trust all
            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, null, null);

            SSLSocketFactory socketFactory = context.getSocketFactory();

            this.sslSocket = socketFactory.createSocket(host, (int) port);
            this.stream = this.sslSocket.getOutputStream();

            String base64Credentials = new String(Base64.getEncoder().encode((sourceName+":"+password).getBytes()));

            // Login on icecast server
            PrintWriter writer = new PrintWriter(this.stream, false);
            writer.println(String.format("SOURCE %s HTTP/1.0", this.channel.getMountpoint()));
            writer.println(String.format("Authorization: Basic %s", base64Credentials));
            writer.println("User-Agent: libshout/2.3.1");
            writer.println(String.format("Content-Type: %s", "audio/mpeg"));
            writer.println(String.format("ice-name: %s", this.channel.getUuid()));
            writer.println("ice-public: 0");
            writer.println(String.format("ice-description: %s", "no description"));
            writer.println();
            writer.flush();

            InputStreamReader isr = new InputStreamReader(this.sslSocket.getInputStream());
            BufferedReader reader = new BufferedReader(isr);
            String data = reader.readLine();

            this.handleResponse(data);
        } catch (IOException | NoSuchAlgorithmException | KeyManagementException e) {
            logger.error("connect(): Connecting to icecast server failed: "+e.getMessage());
            this.stream = null;
        }
    }

    /**
     * Stream an audio track to icecast
     * @param track AudioTrack to stream
     */
    @SuppressWarnings("BusyWait")
    public void stream(AudioTrack track){
        int bufferSize = (int) ((track.getMp3Data().getLength() / track.getMp3Data().getLengthInSeconds()) + 1);
        byte[] buffer = new byte[bufferSize];

        try (InputStream inStream = new FileInputStream(track.getFile())) {
            this.channel.onTrackStarted(track);

            while (!channel.isShutdown() && !channel.isSkippingCurrentTrack()) {
                int read = inStream.read(buffer, 0, bufferSize);

                if(read < 0) {
                    break;
                } else {
                    this.stream.write(buffer, 0, read);
                    this.stream.flush();
                }

                // Only send every second to be on sync
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ignored) { }
            }

            if(channel.isSkippingCurrentTrack()) {
                channel.setSkippingCurrentTrack(false);
            }

            if(channel.isShutdown()) {
                this.channel.onTrackEnded(track, TrackEventListener.REASON_SHUTDOWN);
            } else if(this.channel.getQueue().peek() != null) {
                this.channel.onTrackEnded(track, TrackEventListener.REASON_MAY_START_NEXT);
            } else {
                this.channel.onTrackEnded(track, TrackEventListener.REASON_DONE);
            }
        } catch (Exception ex) {
            this.channel.onTrackException(track, ex);
        }
    }

    /**
     * Handle icecast http responses
     * @param data Data received from icecast
     * @throws SocketException Thrown when an exception occured on the socket connection
     */
    private void handleResponse(String data) throws SocketException {
        if (data.startsWith("HTTP/1.0 401")) {
            throw new SocketException("Not authenticated: username and password do not match");
        } else if (data.startsWith("HTTP/1.0 403 Forbidden")) {
            throw new SocketException("This stream is already streaming");
        } else {
            if (!data.startsWith("HTTP/1.0 200")) {
                throw new SocketException("Unknown exception: "+data);
            }
        }
    }

}
