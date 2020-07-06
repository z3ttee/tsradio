import store from '@/store/index.js';

class Channels {
    getChannelByID(id) {
        return store.state.channels.filter((el) => {
            if(el.id == id) return el;
        })[0];
    }
    registerChannel(data) {
        store.state.channels.push(data);
    }
    updateChannel(data) {
        var index = store.state.channels.indexOf(this.getChannelByID(data.id));
        store.state.channels[index] = data
    }
    updateChannelInfo(data) {
        if(!this.channelExists(data.id)) return;

        var index = store.state.channels.indexOf(this.getChannelByID(data.id));
        store.state.channels[index].info = data;
    }
    channelExists(id) {
        return store.state.channels.filter((el) => {
            if(el.id == id) return el;
        })[0] != null;
    }
    removeChannel(id) {
        if(this.channelExists(id)) return

        var index = store.state.channels.indexOf(this.getChannelByID(id));
        store.state.channels.splice(index, 1);
    }
}


export default new Channels();