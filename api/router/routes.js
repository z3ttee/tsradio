import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'
import userEndpoint from '../endpoints/userEndpoint.js'

const routes = [
    { handler: pingEndpoint, paths: [
        { name: 'Ping', path: '/', method: 'GET', action: 'ping' }
    ]},
    { handler: authEndpoint, paths: [
        { name: 'Login', path: '/auth/signin', method: 'GET', action: 'authenticate' }
    ]},
    { handler: userEndpoint, paths: [
        { name: 'GetMultipleUser', path: '/users', method: 'GET', action: 'getMultiple' },
        { name: 'GetOneUser', path: '/users/:id', method: 'GET', action: 'getOne' },
        { name: 'CreateUser', path: '/users', method: 'POST', action: 'create' }
    ]}
]

export default routes