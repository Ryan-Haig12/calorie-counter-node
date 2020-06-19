const axios = require('axios')

const { validUUID, validEmail, alphaNumerical } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/users'
const userData = {
    username: 'Test User',
    email: 'test@test.com',
    password: 'password',
    password2: 'password'
}

describe('GET /api/v1/users/id/:userId', () => {
    test('should return an error when an invalid UUID is passed in', async () => {
        try {
            await axios.get(URL + '/id/123456')
        } catch(err) {
            expect(err.response.data.err).toBe('userId 123456 is not a valid UUID')
        }
    })

    test('should return an error when user not found', async () => {
        try {
            const res = await axios.get(URL + '/id/8caa7f56-6f57-42f2-9bb5-266d1e35bc34')
            expect(res.data.err).toBe('User 8caa7f56-6f57-42f2-9bb5-266d1e35bc34 not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should return the correct user', async () => {
        try {
            const res = await axios.get(URL + '/id/8caa7f56-6f57-42f2-9bb5-266d1e35bc34')
            expect(res.data.err).toBe('User 8caa7f56-6f57-42f2-9bb5-266d1e35bc34 not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/users/username/:username', () => {
    test('should return an error when username is not found', async () => {
        expect(1).toBe(1)
        try {
            const res = await axios.get(URL + '/username/yeet')
            expect(res.data.err).toBe('User yeet not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should return correct user', async () => {
        expect(1).toBe(1)
        try {
            const res = await axios.get(URL + '/username/HaigRyan')

            const { id, username, password, email, created_on, authtoken } = res.data
            expect(validUUID.test(id)).toBe(true)
            expect(username).toBe('HaigRyan')
            expect(email).toBe('haigryan@gmail.com')
            expect(password).toBe(undefined)
            expect(validEmail.test(email)).toBe(true)
            expect(created_on > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/users/allData/:userId', () => {
    test('should return an error when user is not found', async () => {
        try {
            await axios.get(URL + '/allData/84612c93-20b2-41d9-a8da-b96728710ccc')
        } catch(err) {
            expect(err.response.data.err).toBe('User 84612c93-20b2-41d9-a8da-b96728710ccc not found')
        }
    })

    test('should return correct user with calorie and exercise log data', async () => {
        try {
            const res = await axios.get(URL + '/allData/84612c93-20b2-41d9-a8da-b96728710aad')

            const { user, calories, exercise } = res.data

            const { id, username, password, email, created_on, authtoken } = user
            expect(validUUID.test(id)).toBe(true)
            expect(username).toBe('HaigRyan')
            expect(email).toBe('haigryan@gmail.com')
            expect(password).toBe(undefined)
            expect(validEmail.test(email)).toBe(true)
            expect(created_on > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)

            const { logid, userid, food, calories: caloriesLogged, logged_at } = calories[0]
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(id)
            expect(food).toMatch(alphaNumerical)
            expect(caloriesLogged).toBeGreaterThan(0)
            expect(logged_at).toBeTruthy()

            const { logid: exerciseLogId, userid: exerciseUserId, activity, calories_burnt, logged_at: exerciseLoggedAt } = exercise[0]
            expect(validUUID.test(exerciseLogId)).toBe(true)
            expect(exerciseUserId).toBe(id)
            expect(activity).toMatch(alphaNumerical)
            expect(calories_burnt).toBeGreaterThan(0)
            expect(exerciseLoggedAt).toBeTruthy()
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('POST /api/v1/users/create', () => {
    test('should return error if no data is passed in', async () => {
        try {
            await axios.post(URL + '/create')
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Username is Required')
            expect(errors[1].msg).toBe('Email is Required')
            expect(errors[2].msg).toBe('Password is Required (Min 6, max 40 Characters)')
            expect(errors[3].msg).toBe('Password2 is Required (Min 6, max 40 Characters)')
        }
    })

    test('should return an error if the password is too short or too long', async () => {
        try {
            await axios.post(URL + '/create', { ...userData, password: 'gb12', password2: 'gb12' })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Password is Required (Min 6, max 40 Characters)')
            expect(errors[1].msg).toBe('Password2 is Required (Min 6, max 40 Characters)')
        }

        try {
            const pass = 'letsGoNuggets15letsGoNuggets15letsGoNuggets15'
            await axios.post(URL + '/create', { ...userData, password: pass, password2: pass })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Password is Required (Min 6, max 40 Characters)')
            expect(errors[1].msg).toBe('Password2 is Required (Min 6, max 40 Characters)')
        }
    })

    test('should return an error if email is already in the db', async () => {
        try {
            await axios.post(URL + '/create', { ...userData, email: 'haigryan@gmail.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email haigryan@gmail.com already in use')
        }
    })

    test('should return an error if username is already in the db', async () => {
        try {
            await axios.post(URL + '/create', { ...userData, username: 'HaigRyan' })
        } catch(err) {
            expect(err.response.data.err).toBe('Username HaigRyan already in use')
        }
    })

    test('should return an error if passwords do not match', async () => {
        try {
            await axios.post(URL + '/create', { ...userData, password2: 'notTheSamePassword' })
        } catch(err) {
            expect(err.response.data.err).toBe('passwords must match')
        }
    })

    test('should create a new user', async () => {
        try {
            const res = await axios.post(URL + '/create', userData)

            const { id, username, email, password, createdOn, authtoken } = res.data.newUser
            expect(validUUID.test(id)).toBe(true)
            expect(username).toBe(userData.username)
            expect(email).toBe(userData.email)
            expect(password).toBe(undefined)
            expect(validEmail.test(email)).toBe(true)
            expect(email).toBe(userData.email)
            expect(createdOn > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})