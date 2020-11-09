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
            {name: 'UsersCreate', path: '/users', action: 'create', method: 'post'}
        ]
    },
    {
        handler: groupEndpoint,
        actions: [
            {name: 'GroupsCreateOne', path: '/groups', action: 'create', method: 'post'},
            {name: 'GroupsGetOne', path: '/groups/:id', action: 'getOne', method: 'get'},
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