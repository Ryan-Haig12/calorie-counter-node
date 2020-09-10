const genResponses = require('./responses')

module.exports = {
    '/api/v1/friends/addFriend': {
        post: {
            tags: ['Friends'],
            summary: 'Send a new friend request to another user\'s email',
            requestBody: {
                required: true,
                description: 'Email to send friend request to',
                content: {
                    'application/json': {
                        schema: {
                            properties: {
                                newFriendEmail: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'NewFriendEmail not found', true)
        }
    },
    '/api/v1/friends/confirmFriend': {
        put: {
            tags: ['Friends'],
            summary: 'Confirm a friend request',
            requestBody: {
                required: true,
                description: 'Email that sent the friend request',
                content: {
                    'application/json': {
                        schema: {
                            properties: {
                                confirmedFriendEmail: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'ConfirmedFriendEmail not found', true)
        }
    },
    '/api/v1/friends/deleteFriend': {
        delete: {
            tags: ['Friends'],
            summary: 'Delete a friend request',
            requestBody: {
                required: true,
                description: 'Email to be deleted',
                content: {
                    'application/json': {
                        schema: {
                            properties: {
                                deletedFriendEmail: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: genResponses({ 'type': 'object' }, 'DeletedFriendEmail not found', true)
        }
    },
}