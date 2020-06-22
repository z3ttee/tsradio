package live.tsradio.dataserver.api

import live.tsradio.dataserver.api.channel.ChannelDataUpdate
import live.tsradio.dataserver.handler.RadioHandler

class InitialDataTransport {
    var channels: ArrayList<ChannelDataUpdate> = ArrayList()

    init {
        // Populate
        for(channel in RadioHandler.getChannels()) {
            if(channel.listed) {
                channels.add(channel.toChannelDataUpdate())
            }
        }
    }
}