import config from '@/config/config.dev.json';
import Channels from '@/models/channels.js';
import io from 'socket.io-client';

export const socketMixin = {
    mounted() {
        const protocol = config.dataserver.dev ? 'http://' : 'https://';
        const socket = io(protocol+config.dataserver.host+':'+config.dataserver.port);

        socket.on('onInitialTransport', (event) => {
            for(var channel of JSON.parse(event)) {
                Channels.registerChannel(channel, this.$store);
            }
        });
        socket.on('onChannelUpdate', (event) => {
            var data = JSON.parse(event);
            var oldChannel = Channels.getChannelByID(data.id, this.$store);

            if(oldChannel) {
                Channels.updateChannel(data, this.$store);
            } else {
                Channels.registerChannel(data, this.$store);
            }
        });
        socket.on('onChannelInfoUpdate', (data) => {
            Channels.updateChannelInfo(data, this.$store);
        });
        socket.on('onChannelRemoved', (event) => {
            console.log(event)
        });

        socket.on('connect', () => {
            this.$store.state.channels = [];
        });
        socket.on('connect_error', () => {
            // Show error dialog to user once per session
        });
    }
}