const genResponses = require('./responses')

module.exports = {
    '/api/v1/calories/createLog': {
        post: {
            tags: ['Calorie Logs'],
            summary: 'Create new Calorie Log',
            requestBody: {
                required: true,
                description: 'data relating to the calorie log being created',
                content: {
                    'application/json': {
                        schema: {
                            '$ref': '#/definitions/CalorieLogPayload'
                        }
                    }
                }
            },
            responses: genResponses({ type: 'array', items: 'objects' }, 'User Data not found', true)
        }
    },
    '/api/v1/calories/user/{userId}': {
        get: {
            tags: ['Calorie Logs'],
            summary: 'Get all Calorie Logs by a userId',
            security: [],
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            responses: genResponses({ type: 'array', items: 'objects' }, 'UserId not found', true)
        }
    },
    '/api/v1/calories/log/{logId}': {
        get: {
            tags: ['Calorie Logs'],
            summary: 'Get a single calorieLog by logId',
            security: [],
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            responses: genResponses({ type: 'object' }, 'LogId not found')
        },
        put: {
            tags: ['Calorie Logs'],
            summary: 'Update Calorie Log',
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            requestBody: {
                required: true,
                description: 'data relating to the calorie log being updated',
                content: {
                    'application/json': {
                        schema: {
                            properties: {
                                food: { type: 'string' },
                                calories: { type: 'integer' }
                            }
                        }
                    }
                }
            },
            responses: genResponses({ type: 'object' }, 'LogId not found', true)
        },
        delete: {
            tags: ['Calorie Logs'],
            summary: 'Delete Calorie Log',
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            responses: genResponses({ type: 'object' }, 'LogId not found', true)
        }
    },
    '/api/v1/calories/daterange/{begin}/{end}': {
        get: {
            tags: ['Calorie Logs'],
            summary: 'Get all calorie logs in a specific time frame',
            security: [],
            parameters: [{
                in: 'path',
                name: 'begin',
                required: true
            }, {
                in: 'path',
                name: 'end',
                required: true
            }],
            responses: genResponses({ type: 'array', items: 'object' }, 'No Logs found in the date range provided')
        }
    },
    '/api/v1/calories/food/{foodName}': {
        get: {
            tags: ['Calorie Logs'],
            summary: 'Get all calorie logs with a specific food name',
            security: [],
            parameters: [{
                in: 'path',
                name: 'foodName',
                required: true
            }],
            responses: genResponses({ type: 'array', items: 'object' }, 'Calorie Logs containing foodName not found')
        }
    },
    '/api/v1/calories/calorierange/{begin}/{end}': {
        get: {
            tags: ['Calorie Logs'],
            summary: 'Get all calorie logs in a specific calorie range',
            security: [],
            parameters: [{
                in: 'path',
                name: 'begin',
                required: true
            }, {
                in: 'path',
                name: 'end',
                required: true
            }],
            responses: genResponses({ type: 'array', items: 'object' }, 'No Logs found in the calorie range provided')
        }
    }
}