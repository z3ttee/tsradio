import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'
import userEndpoint from '../endpoints/userEndpoint.js'
import groupEndpoint from '../endpoints/groupEndpoint.js'

const routes = [
    {
        handler: userEndpoint,
        actions: [
            {name: 'UsersGetMultiple', path: '/users', action: 'getMultiple', method: 'get'},
            {name: 'UsersGetOne', path: '/users/:id', action: 'getOne', method: 'get'},
            {name: 'UsersCreate', path: '/users', action: 'create', method: 'post', permission: 'permission.users.canCreate'}
        ]
    },
    {
        handler: groupEndpoint,
        actions: [
            {name: 'GroupsCreateOne', path: '/groups', action: 'create', method: 'post', permission: 'permission.groups.canCreate'},
            {name: 'GroupsGetMultiple', path: '/groups', action: 'getMultiple', method: 'get', permission: 'permission.groups.canRead'},
            {name: 'GroupsGetOne', path: '/groups/:id', action: 'getOne', method: 'get', permission: 'permission.groups.canRead'},
            {name: 'GroupsRemoveOne', path: '/groups/:id', action: 'removeOne', method: 'delete', permission: 'permission.groups.canDelete'},

        ]
    },
    {
        handler: authEndpoint,
        actions: [
            {name: 'AuthSignin', path: '/auth/signin', action: 'signin', method: 'get'}
        ]
    },
    {
        handler: pingEndpoint,
        actions: [
            {name: 'CatchAll', path: '*', action: 'index', method: 'all'}
        ]
    }
]

export default routes