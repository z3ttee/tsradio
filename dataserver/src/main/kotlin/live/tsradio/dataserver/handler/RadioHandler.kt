package live.tsradio.dataserver.handler

import live.tsradio.dataserver.Server
import live.tsradio.dataserver.api.RadioDataTypes
import live.tsradio.dataserver.packets.channel.ChannelDataPacket
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object RadioHandler {

    private val channelData = HashMap<String, ChannelDataPacket>()
    private val listeners = HashMap<UUID, UUID>() // UUID of client, Channel the user is listening to
    private val listenersPerChannel = HashMap<UUID, ArrayList<UUID>>() // UUID of channel, List of UUID of listeners
    private val subscribedData = HashMap<UUID, ArrayList<RadioDataTypes>>()
    private val casio: String? = null

    fun setChannelData(uuid: String, data: ChannelDataPacket){
        this.channelData[uuid] = data
    }

    /**
     * Move a listener to a different channel
     */
    fun move(uuid: UUID, from: UUID?, to: UUID?){
        if(to == null) {
            this.listeners.remove(uuid)
        } else {
            this.listeners[uuid] = to
            addToChannel(uuid, to)
        }

        if(from != null) removeFromChannel(uuid, from)
    }

    /**
     * Add a listener to a channel
     */
    fun addToChannel(uuid: UUID, channelUUID: UUID){
        if(this.listenersPerChannel.containsKey(channelUUID)) {
            listenersPerChannel[channelUUID]!!.add(uuid)
        }
    }

    /**
     * Remove a listener from a channel
     */
    fun remove(uuid: UUID){
        this.listeners.remove(uuid)
    }
    /**
     * Remove a listener from a channel
     */
    fun removeFromChannel(uuid: UUID, channelUUID: UUID){
        if(this.listenersPerChannel.containsKey(channelUUID)) {
            listenersPerChannel[channelUUID]!!.remove(uuid)
        }
    }

    /**
     * Subscribe to specific types of data that is transported through socket
     */
    fun clientSubscribeData(uuid: UUID, dataType: RadioDataTypes) {
        if(this.subscribedData.containsKey(uuid)) {
            val subscribedData = this.subscribedData[uuid]
            if(!subscribedData!!.contains(dataType)) subscribedData.add(dataType)
        } else {
            this.subscribedData[uuid] = ArrayList(listOf(dataType))
        }

        //TODO: Send initial data
        Server.server.getClient(uuid).sendEvent("initialChannelDataTransport", ArrayList<String>())
    }

    fun clientHasSubscribed(uuid: UUID, dataType: RadioDataTypes): Boolean {
        return if(this.subscribedData.containsKey(uuid)){
            val subscribedData = this.subscribedData.getOrDefault(uuid, ArrayList())
            return subscribedData.contains(dataType)
        } else {
            false
        }
    }

    /**
     * Unsubscribe from specific types of data that is transported through socket
     */
    fun clientUnsubscribeData(uuid: UUID, dataType: RadioDataTypes) {
        if(this.subscribedData.containsKey(uuid)) {
            val subscribedData = this.subscribedData[uuid]
            if(subscribedData!!.contains(dataType)) subscribedData.remove(dataType)
        }
    }

    /**
     * Check if client has selected a channel and is listening to it
     */
    fun isListening(uuid: UUID): Boolean {
        return this.listeners.containsKey(uuid)
    }

    /**
     * Get the channel of a listening client
     */
    fun getChannelOfClient(uuid: UUID): UUID? {
        return this.listeners[uuid]
    }

    /**
     * Get amount of listeners listening to a channel
     */
    fun getListenerCountOfChannel(uuid: UUID): Int {
        return this.listenersPerChannel.getOrDefault(uuid, ArrayList()).size
    }

    fun getListeners(): List<UUID> {
        return this.listeners.keys.toList()
    }
    fun getChannels(): List<ChannelDataPacket> {
        return this.channelData.values.toList()
    }

    fun getChannel(uuid: String): ChannelDataPacket? {
        return this.channelData[uuid]
    }
}