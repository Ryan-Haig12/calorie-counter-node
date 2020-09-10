// twoHundredSchema: Object response for a successful 200 call
// fourOhFourMessage: String message to be shown when a 404 error occurs
// requiresAuth: Boolean to decide if a 401 error is required
module.exports = (twoHundredSchema, fourOhFourMessage, requiresAuth) => {
    const responses = {
        200: {
            description: 'OK',
            schema: twoHundredSchema
        },
        400: {
            description: 'Bad Request'
        }
    }

    if(requiresAuth) {
        responses['401'] = { description: 'Un-Authenticated' }
    }

    if(fourOhFourMessage) {
        responses['404'] = { description: fourOhFourMessage }
    }

    return responses
}