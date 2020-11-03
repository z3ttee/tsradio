import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'
import userEndpoint from '../endpoints/userEndpoint.js'

const routes = {
    'api/users': {
        handler: userEndpoint,
        actions: [
            { name: 'GetOneUser', path: '/users/:id', method: 'get', action: 'getOne' },
            { name: 'CreateUser', path: '/users', method: 'post', action: 'create' },
            { name: 'GetMultipleUser', path: '/users', method: 'get', action: 'getMultiple' },
        ]
    }
}

export default routes