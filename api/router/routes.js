import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'
import userEndpoint from '../endpoints/userEndpoint.js'
import groupEndpoint from '../endpoints/groupEndpoint.js'
import playlistEndpoint from '../endpoints/playlistEndpoint.js'
import channelEndpoint from '../endpoints/channelEndpoint.js'

const routes = [
    {
        groupname: 'users',
        handler: userEndpoint,
        actions: [
            {name: 'UsersGetMultiple', path: '/users', action: 'getMultiple', method: 'get', permission: 'permission.users.canRead'},
            {name: 'UsersGetOne', path: '/users/:id', action: 'getOne', method: 'get'},
            {name: 'UsersCreate', path: '/users', action: 'create', method: 'post', permission: 'permission.users.canCreate'},
            {name: 'UsersUpdateOne', path: '/users/:id', action: 'updateOne', method: 'put', permission: 'permission.users.canUpdate'},
            {name: 'UsersDeleteOne', path: '/users/:id', action: 'deleteOne', method: 'delete', permission: 'permission.users.canDelete'}
        ]
    },
    {
        groupname: 'groups',
        handler: groupEndpoint,
        actions: [
            {name: 'GroupsCreateOne', path: '/groups', action: 'create', method: 'post', permission: 'permission.groups.canCreate'},
            {name: 'GroupsGetMultiple', path: '/groups', action: 'getMultiple', method: 'get', permission: 'permission.groups.canRead'},
            {name: 'GroupsGetOne', path: '/groups/:id', action: 'getOne', method: 'get', permission: 'permission.groups.canRead'},
            {name: 'GroupsRemoveOne', path: '/groups/:id', action: 'removeOne', method: 'delete', permission: 'permission.groups.canDelete'},
            {name: 'GroupsUpdateOne', path: '/groups/:id', action: 'updateOne', method: 'put', permission: 'permission.groups.canUpdate'},
        ]
    },
    {
        groupname: 'playlists',
        handler: playlistEndpoint,
        actions: [
            {name: 'PlaylistsCreateOne', path: '/playlists', action: 'createOne', method: 'post', permission: 'permission.playlists.canCreate'},
            {name: 'PlaylistsGetOne', path: '/playlists/:id', action: 'getOne', method: 'get'},
            {name: 'PlaylistsGetByUser', path: '/playlists/@user/:id', action: 'getByUser', method: 'get'},
            {name: 'PlaylistsGetMultiple', path: '/playlists', action: 'getMultiple', method: 'get'},
            {name: 'PlaylistsRemoveOne', path: '/playlists/:id', action: 'removeOne', method: 'delete', permission: 'permission.playlists.canDelete'},
            {name: 'PlaylistsUpdateOne', path: '/playlists/:id', action: 'updateOne', method: 'put', permission: 'permission.playlists.canUpdate'},
        ]
    },
    {
        groupname: 'channels',
        handler: channelEndpoint,
        actions: [
            {name: 'ChannelsCreateOne', path: '/channels', action: 'createOne', method: 'post', permission: 'permission.channels.canCreate'},
            {name: 'ChannelsGetOne', path: '/channels/:id', action: 'getOne', method: 'get'},

        ]
    },
    {
        groupname: 'auth',
        handler: authEndpoint,
        actions: [
            {name: 'AuthSignin', path: '/auth/signin', action: 'signin', method: 'get'}
        ]
    },
    {
        groupname: 'all',
        handler: pingEndpoint,
        actions: [
            {name: 'CatchAll', path: '*', action: 'index', method: 'all'}
        ]
    }
]

export default routes