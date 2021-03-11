import store from '@/store/'

function buildChannelCoverUrl(channelId) {
    return store.state.coverBaseUrl + "/channel/" + channelId
}

function buildChannelCurrentUrl(channelId) {
    return store.state.coverBaseUrl + "/current/" + channelId
}

function buildChannelHistoryUrl(channelId, timestamp) {
    return store.state.coverBaseUrl + "/history/" + channelId + "/?timestamp=" + timestamp
}

export {
    buildChannelCoverUrl,
    buildChannelHistoryUrl,
    buildChannelCurrentUrl
}