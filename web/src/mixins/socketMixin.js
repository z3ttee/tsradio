import config from '@/config/config.dev.json';
import Channels from '@/models/channels.js';
import io from 'socket.io-client';

export const socketMixin = {
    mounted() {
        const protocol = config.dataserver.dev ? 'http://' : 'https://';
        const socket = io(protocol+config.dataserver.host+':'+config.dataserver.port);

        socket.on('onNodeChannelUpdate', (data) => {
            var channel = JSON.parse(data);
            channel.coverURL = 'https://tsradio.live/upload/covers/'+channel.id+'.png';
            channel.listenerCount = 0;

            if(Channels.channelExists(channel.id)) {
                Channels.updateChannel(channel);
            } else {
                Channels.registerChannel(channel);
            }
        });
        socket.on('onNodeChannelInfoUpdate', (data) => {
            Channels.updateChannelInfo(JSON.parse(data))
        });
        socket.on('onNodeChannelRemoved', (data) => {
            Channels.removeChannel(JSON.parse(data).id)
        });

        socket.on('connect', () => {
            this.$store.state.channels = [];
        });
        socket.on('disconnect', () => {
            this.$store.state.channels = [];
        });
        socket.on('connect_error', () => {
            // Show error dialog to user once per session
        });
    }
}