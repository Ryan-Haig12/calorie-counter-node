const genResponses = require('./responses')

module.exports = {
    '/api/v1/exercise/createLog': {
        post: {
            tags: ['Exercise Logs'],
            summary: 'Create new Exercise Log',
            requestBody: {
                required: true,
                description: 'data relating to the exercise log being created',
                content: {
                    'application/json': {
                        schema: {
                            '$ref': '#/definitions/ExerciseLogPayload'
                        }
                    }
                }
            },
            responses: genResponses({ type: 'array', items: 'objects' }, 'User Data not found', true)
        }
    },
    '/api/v1/exercise/user/{userId}': {
        get: {
            tags: ['Exercise Logs'],
            summary: 'Get all Exercise Logs by a userId',
            security: [],
            parameters: [{
                in: 'path',
                name: 'userId',
                required: true
            }],
            responses: genResponses({ type: 'array', items: 'objects' }, 'UserId not found')
        }
    },
    '/api/v1/exercise/log/{logId}': {
        get: {
            tags: ['Exercise Logs'],
            summary: 'Get a single Exercise Log by logId',
            security: [],
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            responses: genResponses({ 'type': 'object' }, 'LogId not found')
        },
        put: {
            tags: ['Exercise Logs'],
            summary: 'Update Exercise Log',
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            requestBody: {
                required: true,
                description: 'data relating to the exercise log being updated',
                content: {
                    'application/json': {
                        schema: {
                            properties: {
                            activity: { 'type': 'string' },
                            calories_burnt: { 'type': 'integer' }
                            }
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'LogId not found', true)
        },
        delete: {
            tags: ['Exercise Logs'],
            summary: 'Delete Exercise Log',
            parameters: [{
                in: 'path',
                name: 'logId',
                required: true
            }],
            responses: genResponses({ 'type': 'object' }, 'LogId not found', true)
        }
    },
    '/api/v1/exercise/daterange/{begin}/{end}': {
        get: {
            tags: ['Exercise Logs'],
            summary: 'Get all exercise logs in a specific time frame',
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
            responses: genResponses({ 'type': 'array', 'items': 'objects' }, 'No Exercise Logs found in the given range')
        }
    },
    '/api/v1/exercise/activity/{activityName}': {
        get: {
            tags: ['Exercise Logs'],
            summary: 'Get all exercise logs with a specific exercise name',
            security: [],
            parameters: [{
                in: 'path',
                name: 'activityName',
                required: true
            }],
            responses: genResponses({ 'type': 'array', 'items': 'objects' }, 'No Exercise Logs found for the given ActivityName')
        }
    },
    '/api/v1/exercise/calorierange/{begin}/{end}': {
        get: {
            tags: ['Exercise Logs'],
            summary: 'Get all exercise logs in a specific calorie range',
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
            responses: genResponses({ 'type': 'array', 'items': 'objects' }, 'No Exercise Logs found for the given range')
        }
    },
}