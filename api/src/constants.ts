
const EVENT_CHANNEL_PREFIX = "eu.tsalliance.tsradio.channel";

// Roles
export const ROLE_ADMIN = "admin";

export const GATEWAY_EVENT_CHANNEL_CREATED = `${EVENT_CHANNEL_PREFIX}.created`;
export const GATEWAY_EVENT_CHANNEL_REQUEST_RESTART = `${EVENT_CHANNEL_PREFIX}.request_restart`;
export const GATEWAY_EVENT_CHANNEL_UPDATED = `${EVENT_CHANNEL_PREFIX}.updated`;
export const GATEWAY_EVENT_CHANNEL_DELETED = `${EVENT_CHANNEL_PREFIX}.deleted`;
export const GATEWAY_EVENT_CHANNEL_PUSH_LIST = `${EVENT_CHANNEL_PREFIX}.push_list`;

export const HISTORY_SIZE = parseInt(process.env.HISTORY_SIZE ?? "10");
