const genResponses = require('./responses')

module.exports = {
    '/api/v1/auth': {
        post: {
            tags: ['Auth'],
            security: [],
            summary: 'Login to the API by receiving a valid JWT',
            requestBody: {
                required: true,
                description: 'User to be logged in',
                content: {
                    'application/json': {
                        schema: {
                            '$ref': '#/definitions/AuthPayload'
                        }
                    }
                }
            },
            responses: genResponses({ '$ref': '#/definitions/Authenticated' }, 'Email not found')
        }
    }
}