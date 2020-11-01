import pingEndpoint from '../endpoints/pingEndpoint.js'
import authEndpoint from '../endpoints/authEndpoint.js'

const routes = [
    { handler: pingEndpoint, paths: [
        { name: 'Ping', path: '/', method: 'GET', action: 'ping' }
    ]},
    { handler: authEndpoint, paths: [
        { name: 'Login', path: '/auth/signin', method: 'GET', action: 'authenticate' }
    ]}
]

export default routes