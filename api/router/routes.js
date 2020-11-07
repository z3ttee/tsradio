import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'
import userEndpoint from '../endpoints/userEndpoint.js'

const routes = [
    {
        handler: userEndpoint,
        actions: [
            {name: 'UsersGetMultiple', path: '/users', action: 'getMultiple', method: 'get'},
            {name: 'UsersGetOne', path: '/users/:id', action: 'getOne', method: 'get'},
            {name: 'UsersCreate', path: '/users', action: 'create', method: 'post'}
        ]
    }
]

export default routes