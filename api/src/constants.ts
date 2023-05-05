const BASE_CONST = "eu.tsalliance.tsradio";
const CHANNEL_CONST_PREFIX = `${BASE_CONST}.channel`;

// Roles
export const ROLE_ADMIN = "admin";

export const GATEWAY_EVENT_CHANNEL_CREATED = `${CHANNEL_CONST_PREFIX}.created`;
export const GATEWAY_EVENT_CHANNEL_UPDATED = `${CHANNEL_CONST_PREFIX}.updated`;
export const GATEWAY_EVENT_CHANNEL_DELETED = `${CHANNEL_CONST_PREFIX}.deleted`;
export const GATEWAY_EVENT_CHANNEL_REQUEST_RESTART = `${CHANNEL_CONST_PREFIX}.request_restart`;
export const GATEWAY_EVENT_CHANNEL_PUSH_LIST = `${CHANNEL_CONST_PREFIX}.push_list`;
export const GATEWAY_EVENT_CHANNEL_PUSH_HISTORY = `${CHANNEL_CONST_PREFIX}.push_history`;

export const HISTORY_SIZE = parseInt(process.env.HISTORY_SIZE ?? "10");
