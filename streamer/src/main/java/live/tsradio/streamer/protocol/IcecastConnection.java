package live.tsradio.streamer.protocol;

import live.tsradio.streamer.files.FileHandler;
import live.tsradio.streamer.listener.TrackEventListener;
import live.tsradio.streamer.objects.AudioTrack;
import live.tsradio.streamer.objects.Channel;
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

public class IcecastConnection {
    private final Logger logger = LoggerFactory.getLogger(IcecastConnection.class);

    @Getter private final IcecastMount mountpoint;
    @Getter private final Channel channel;
    @Getter private Socket sslSocket;
    @Getter private OutputStream stream;
    @Getter private final JSONObject icecastConfig = (JSONObject) FileHandler.getInstance().getConfig().get("icecast");

    public IcecastConnection(Channel channel, IcecastMount mountpoint) {
        this.channel = channel;
        this.mountpoint = mountpoint;
    }

    public boolean isConnected() {
        return this.stream != null;
    }

    public void connect() {
        logger.info("connect(): Connecting to icecast server...");

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

            //File testFile = new File(System.getProperty("user.dir"), "backtimer.mp3");

            // Login on icecast server
            PrintWriter writer = new PrintWriter(this.stream, false);
            writer.println(String.format("SOURCE %s HTTP/1.0", this.mountpoint.getPath()));
            writer.println(String.format("Authorization: Basic %s", base64Credentials));
            writer.println("User-Agent: libshout/2.3.1");
            writer.println(String.format("Content-Type: %s", "audio/mpeg"));
            writer.println(String.format("ice-name: %s", this.mountpoint.getName()));
            writer.println("ice-public: 0");
            writer.println(String.format("ice-description: %s", "no description"));
            writer.println();
            writer.flush();

            InputStreamReader isr = new InputStreamReader(this.sslSocket.getInputStream());
            BufferedReader reader = new BufferedReader(isr);
            String data = reader.readLine();

            this.handleResponse(data);
        } catch (IOException | NoSuchAlgorithmException | KeyManagementException e) {
            logger.info("connect(): Connecting to icecast server failed: "+e.getMessage());
            this.stream = null;
            e.printStackTrace();
        }
    }

    @SuppressWarnings("BusyWait")
    public void stream(AudioTrack track){
        int bufferSize = (int) ((track.getMp3Data().getLength() / track.getMp3Data().getLengthInSeconds()) + 1);
        byte[] buffer = new byte[bufferSize];

        try (InputStream inStream = new FileInputStream(track.getFile())) {
            TrackEventListener.onTrackStart(this.channel, track);

            while (!channel.shutdown) {
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

            if(this.channel.getQueue().peek() != null) {
                TrackEventListener.onTrackEnd(this.channel, track, TrackEventListener.REASON_MAY_START_NEXT, null);
            } else {
                TrackEventListener.onTrackEnd(this.channel, track, TrackEventListener.REASON_DONE, null);
            }
        } catch (IOException ex) {
            TrackEventListener.onTrackEnd(this.channel, track, TrackEventListener.REASON_EXCEPTION, ex);
        }
    }

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
