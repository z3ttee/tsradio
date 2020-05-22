package live.tsradio.daemon.files

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.*
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import com.google.gson.GsonBuilder
import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.channel.ChannelHandler
import live.tsradio.daemon.channel.PlaylistHandler
import live.tsradio.daemon.exception.CannotLoadConfigException
import live.tsradio.daemon.exception.MissingFileException
import live.tsradio.daemon.sound.Playlist
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.*

object Filesystem {
    private val logger: Logger = LoggerFactory.getLogger(Filesystem::class.java)

    val rootDirectory: File = File(System.getProperty("user.dir"))
    val playlistDirectory: File = File(rootDirectory.absolutePath+File.separator+"playlists")
    val preferencesFile: File = File(rootDirectory.absolutePath, "preferences.json")
    val serviceAccountFile: File = File(rootDirectory.absolutePath, "serviceAccount.json")

    var database: Firestore? = null
    var preferences: Preferences = Preferences()

    val genres: HashMap<String, Channel> = HashMap()
    val playlists: HashMap<String, Channel> = HashMap()

    init {
        if(!serviceAccountFile.exists()) throw MissingFileException(serviceAccountFile)

        // Create playlists directory
        if(!playlistDirectory.exists()) {
            playlistDirectory.mkdirs()
        }

        // Load config
        loadConfig()

        // Init firestore
        val serviceAccount: InputStream = FileInputStream(this.serviceAccountFile)
        val credentials = GoogleCredentials.fromStream(serviceAccount)
        val options = FirebaseOptions.Builder().setCredentials(credentials).build()
        FirebaseApp.initializeApp(options)

        // Init firestore database
        this.database = FirestoreClient.getFirestore()

        // Add query listener to listen on changes
        if(this.database != null) {
            this.database!!.collection(preferences.firestore.channelCollection).whereEqualTo("nodeID", preferences.node.nodeID).addSnapshotListener(ChannelChangeListener())
            this.database!!.collection(preferences.firestore.playlistCollection).whereEqualTo("nodeID", preferences.node.nodeID).addSnapshotListener(PlaylistChangeListener())
            this.database!!.collection(preferences.firestore.genreCollection).whereEqualTo("nodeID", preferences.node.nodeID).addSnapshotListener(GenreChangeListener())
        }
    }

    private fun loadConfig(){
        preferencesFile.setReadable(true)
        preferencesFile.setWritable(true)

        if(!preferencesFile.exists()) {
            if(!preferencesFile.createNewFile()) throw CannotLoadConfigException()

            val gson = GsonBuilder().setPrettyPrinting().create()
            val writer = FileWriter(preferencesFile)
            writer.write(gson.toJson(Preferences()))
            writer.flush()
            writer.close()
        }

        this.preferences = GsonBuilder().create().fromJson(FileReader(preferencesFile), Preferences::class.java)
    }

    fun getChannelCollection(): CollectionReference{
        return this.database!!.collection(this.preferences.firestore.channelCollection)
    }
    fun getPlaylistCollection(): CollectionReference{
        return this.database!!.collection(this.preferences.firestore.playlistCollection)
    }
    fun getGenreCollection(): CollectionReference{
        return this.database!!.collection(this.preferences.firestore.genreCollection)
    }

    private class ChannelChangeListener: EventListener<QuerySnapshot> {
        override fun onEvent(value: QuerySnapshot?, error: FirestoreException?) {
            if(value != null){
                for(doc in value.documents) {
                    val channelPOJO = doc.toObject(Channel.ChannelPOJO::class.java)
                    val data = channelPOJO.toChannel()

                    if(!ChannelHandler.configuredChannels.containsKey(channelPOJO.channelName)) {
                        ChannelHandler.configuredChannels[channelPOJO.channelName] = data
                        ChannelHandler.startChannel(channelPOJO.channelName)
                        logger.info("Received channel '${channelPOJO.channelName}' from database.")
                    } else if(ChannelHandler.isChannelActiveByName(channelPOJO.channelName)) {
                        logger.info("Received update for channel '${channelPOJO.channelName}' from database. Updating...")
                        val channel = ChannelHandler.configuredChannels[channelPOJO.channelName]!!
                        channel.liveUpdate(data)
                    } else {
                        logger.info("Received update for channel '${channelPOJO.channelName}' from database.")
                        ChannelHandler.startChannel(data)
                    }
                }
            }

            error?.printStackTrace()
        }
    }

    private class PlaylistChangeListener: EventListener<QuerySnapshot> {
        override fun onEvent(value: QuerySnapshot?, error: FirestoreException?) {
            if(value != null){
                for(doc in value.documents) {
                    val playlistPOJO = doc.toObject(Playlist.PlaylistPOJO::class.java)
                    val data = playlistPOJO.toPlaylist()

                    logger.info("Received update for playlist '${playlistPOJO.name}' from database.")
                    if(!PlaylistHandler.configuredPlaylists.containsKey(playlistPOJO.name)) {
                        PlaylistHandler.configuredPlaylists[playlistPOJO.name] = data
                        ChannelHandler.notifyPlaylistReceived(playlistPOJO.name)
                    } else {
                        val playlist = PlaylistHandler.configuredPlaylists[playlistPOJO.name]!!
                        playlist.liveUpdate(data)
                    }
                }
            }

            error?.printStackTrace()
        }
    }

    private class GenreChangeListener: EventListener<QuerySnapshot> {
        override fun onEvent(value: QuerySnapshot?, error: FirestoreException?) {
            logger.info("onEvent(): Received genre data from firestore.")
        }
    }
}