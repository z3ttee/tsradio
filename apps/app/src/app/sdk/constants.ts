const BASE_CONST = "eu.tsalliance.tsradio";
const CHANNEL_CONST_PREFIX = `${BASE_CONST}.channel`;
const STORAGE_CONST_PREFIX = `${BASE_CONST}.local_storage`;

export const DEFAULT_VOLUME = 30;

export const LOCALSTORAGE_VOLUME_KEY = `${STORAGE_CONST_PREFIX}.player.volume`;

export const GATEWAY_EVENT_CHANNEL_CREATED = `${CHANNEL_CONST_PREFIX}.created`;
export const GATEWAY_EVENT_CHANNEL_UPDATED = `${CHANNEL_CONST_PREFIX}.updated`;
export const GATEWAY_EVENT_CHANNEL_DELETED = `${CHANNEL_CONST_PREFIX}.deleted`;
export const GATEWAY_EVENT_CHANNEL_STATUS_CHANGED= `${CHANNEL_CONST_PREFIX}.status-changed`;
