import store from '@/store/'

function buildChannelCoverUrl(channelId) {
    return store.state.urls.coverBase + "/channel/" + channelId
}

function buildChannelCurrentUrl(channelId) {
    return store.state.urls.coverBase + "/current/" + channelId
}

function buildChannelHistoryUrl(channelId, timestamp) {
    var url = store.state.urls.coverBase + "/history/" + channelId + "/?timestamp=" + timestamp
    return url
}

export {
    buildChannelCoverUrl,
    buildChannelHistoryUrl,
    buildChannelCurrentUrl
}