module.exports = {
    definitions: {
        Authenticated: {
            required: [
                'user',
                'jwt'
            ],
            properties: {
                'user': { 'type': 'object' },
                'jwt': { 'type': 'string' }
            }
        },
        AuthPayload: {
            required: [
                'email',
                'password'
            ],
            properties: {
                'email': { 'type': 'string' },
                'password': { 'type': 'string' }
            }
        },
        CalorieLogPayload: {
            required: [
                'userId',
                'food',
                'calories',
                'timeOfDay'
            ],
            properties: {
                'userId': { 'type': 'string' },
                'food': { 'type': 'string' },
                'calories': { 'type': 'integer' },
                'timeOfDay': { 'type': 'string' }
            }
        },
        CreateUserPayload: {
            required: [
                'username',
                'email',
                'password',
                'password2',
                'currentWeight',
                'idealWeight',
                'dailyCalorieIntake',
                'gender',
                'birthday',
                'age'
            ],
            properties: {
                username: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                password2: { type: 'string' },
                currentWeight: { type: 'integer' },
                idealWeight: { type: 'integer' },
                dailyCalorieIntake: { type: 'integer' },
                gender: { type: 'string' },
                birthday: { type: 'string' },
                age: { type: 'integer' }
            }
        },
        ExerciseLogPayload: {
            required: [
                'userId',
                'activity',
                'calories_burnt'
            ],
            properties: {
                'userId': { 'type': 'string' },
                'activity': { 'type': 'string' },
                'calories_burnt': { 'type': 'integer' }
            }
        },
        UpdateUserBasicDataPayload: {
            required: [
                'username',
                'email',
                'password',
                'password2',
            ],
            properties: {
                'email': { 'type': 'string' },
                'username': { 'type': 'string' },
                'password': { 'type': 'string' },
                'password2': { 'type': 'string' }
            }
        }
    }
}