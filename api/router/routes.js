import pingEndpoint from '../endpoints/pingEndpoint.js'

const routes = [
    { handler: pingEndpoint, paths: [
        { name: 'Ping', path: '/', method: 'GET', action: 'ping' }
    ]}
]

export default routes