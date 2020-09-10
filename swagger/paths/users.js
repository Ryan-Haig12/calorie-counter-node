const genResponses = require('./responses')

module.exports = {
    '/api/v1/users/id/{userId}': {
        get: {
            tags: ['Users'],
            summary: 'Get a single user by their Id',
            security: [],
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            responses: genResponses({ 'type': 'object' }, 'UserId not found')
        }
    },
    '/api/v1/users/userName/{userName}': {
        get: {
            tags: ['Users'],
            summary: 'Get a single user by their userName',
            security: [],
            parameters: [{
                in: 'path',
                name: 'userName',
                required: true
            }],
            responses: genResponses({ 'type': 'array', 'items': 'objects' }, 'UserName not found')
        }
    },
    '/api/v1/users/allData/{userId}': {
        get: {
            tags: ['Users'],
            summary: 'Get all user data by their userId',
            security: [],
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            responses: genResponses({ 'type': 'object' }, 'UserName not found')
        }
    },
    '/api/v1/users/create': {
        post: {
            tags: ['Users'],
            summary: 'Create a new user',
            security: [],
            requestBody: {
                required: true,
                description: 'Details of user to create',
                content: {
                    'application/json': {
                        schema: {
                            '$ref': '#/definitions/CreateUserPayload'
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'UserName not found')
        }
    },
    '/api/v1/users/update/{userId}': {
        put: {
            tags: ['Users'],
            summary: 'Update a given User by their UserId',
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            requestBody: {
                required: true,
                description: 'User data to be updated',
                content: {
                    'application/json': {
                        schema: {
                            '$ref': '#/definitions/UpdateUserBasicDataPayload'
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'UserId not found', true)
        }
    },
    '/api/v1/users/delete/{userId}': {
        delete: {
            tags: ['Users'],
            summary: 'Delete a given User by their userId',
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            responses: genResponses({ 'type': 'object' }, 'UserId not found', true)
        }
    }
}