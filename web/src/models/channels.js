class Channels {
    getChannelByID(id, vuestore) {
        return vuestore.state.channels.filter((el) => {
            if(el.id == id) return el;
        })[0];
    }
    registerChannel(data, vuestore) {
        vuestore.state.channels.push(data);
    }
    updateChannel(data, vuestore) {
        var index = vuestore.state.channels.indexOf(this.getChannelByID(data.id, vuestore));
        vuestore.state.channels.splice(index, 0, data)
    }
    updateChannelInfo(data, vuestore) {
        if(!this.channelExists(data.id, vuestore)) return;

        var index = vuestore.state.channels.indexOf(this.getChannelByID(data.id, vuestore));
        vuestore.state.channels[index].info = data;
    }
    channelExists(id, vuestore) {
        return vuestore.state.channels.filter((el) => {
            if(el.id == id) return el;
        })[0] != null;
    }
}


export default new Channels();