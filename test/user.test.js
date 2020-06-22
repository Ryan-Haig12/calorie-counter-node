const axios = require('axios')

const { validUUID, validEmail, alphaNumerical } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/users'
const AUTH_URL = 'http://localhost:4000/api/v1/auth'

const userData = {
    username: 'Test User',
    email: 'test@test.com',
    password: 'password',
    password2: 'password'
}
const newUserData = {
    username: 'A New User',
    email: 'testguy@test.com',
    password: 'newPassword',
    password2: 'newPassword'
}
let userId = ''
let userClient // soon to be axios client

describe('GET /api/v1/users/id/:userId', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        userClient = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when an invalid UUID is passed in', async () => {
        try {
            await userClient.get('/id/123456')
        } catch(err) {
            expect(err.response.data.err).toBe('userId 123456 is not a valid UUID')
        }
    })

    test('should return an error when user not found', async () => {
        try {
            const res = await userClient.get('/id/8caa7f56-6f57-42f2-9bb5-266d1e35bc34')
            expect(res.data.err).toBe('User 8caa7f56-6f57-42f2-9bb5-266d1e35bc34 not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should return the correct user', async () => {
        try {
            const res = await userClient.get('/id/8caa7f56-6f57-42f2-9bb5-266d1e35bc34')
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
            const res = await userClient.get('/username/yeet')
            expect(res.data.err).toBe('User yeet not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should return correct user', async () => {
        expect(1).toBe(1)
        try {
            const res = await userClient.get('/username/HaigRyan')

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
            await userClient.get('/allData/84612c93-20b2-41d9-a8da-b96728710ccc')
        } catch(err) {
            expect(err.response.data.err).toBe('User 84612c93-20b2-41d9-a8da-b96728710ccc not found')
        }
    })

    test('should return correct user with calorie and exercise log data', async () => {
        try {
            const res = await userClient.get('/allData/84612c93-20b2-41d9-a8da-b96728710aad')

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
            await userClient.post('/create')
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
            await userClient.post('/create', { ...userData, password: 'gb12', password2: 'gb12' })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Password is Required (Min 6, max 40 Characters)')
            expect(errors[1].msg).toBe('Password2 is Required (Min 6, max 40 Characters)')
        }

        try {
            const pass = 'letsGoNuggets15letsGoNuggets15letsGoNuggets15'
            await userClient.post('/create', { ...userData, password: pass, password2: pass })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Password is Required (Min 6, max 40 Characters)')
            expect(errors[1].msg).toBe('Password2 is Required (Min 6, max 40 Characters)')
        }
    })

    test('should return an error if email is already in the db', async () => {
        try {
            await userClient.post('/create', { ...userData, email: 'haigryan@gmail.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email haigryan@gmail.com already in use')
        }
    })

    test('should return an error if username is already in the db', async () => {
        try {
            await userClient.post('/create', { ...userData, username: 'HaigRyan' })
        } catch(err) {
            expect(err.response.data.err).toBe('Username HaigRyan already in use')
        }
    })

    test('should return an error if passwords do not match', async () => {
        try {
            await userClient.post('/create', { ...userData, password2: 'notTheSamePassword' })
        } catch(err) {
            expect(err.response.data.err).toBe('passwords must match')
        }
    })

    test('should create a new user', async () => {
        try {
            const res = await userClient.post('/create', userData)

            const { id, username, email, password, createdOn, authtoken } = res.data.newUser
            expect(validUUID.test(id)).toBe(true)
            expect(username).toBe(userData.username)
            expect(email).toBe(userData.email)
            expect(password).toBe(undefined)
            expect(validEmail.test(email)).toBe(true)
            expect(email).toBe(userData.email)
            expect(createdOn > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)

            // set the userId up so that this user can be deleted below
            userId = id
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('PUT /api/v1/users/update/:userId', () => {
    test('should return an error if the userID is not a valid uuid', async () => {
        try {
            await userClient.put('/update/84612c93-20b2', userData)
        } catch(err) {
            expect(err.response.data.err).toBe('userId 84612c93-20b2 is not a valid UUID')
        }
    })

    test('should return an error if new data is not passed in', async () => {
        try {
            await userClient.put('/update/84612c93-20b2-41d9-a8da-b96728710aad', {})
        } catch(err) {
            expect(err.response.data.err).toBe('Need to pass in at least one email, password, or username')
        }
    })

    test('should return an error if the userId is not found', async () => {
        try {
            await userClient.put('/update/84612c93-20b2-41d9-a8da-b96728710ccc', userData)
        } catch(err) {
            expect(err.response.data.err).toBe('User 84612c93-20b2-41d9-a8da-b96728710ccc not found')   
        }
    })

    test('should return an error if the new email is already in use', async () => {
        try {
            await userClient.put(`/update/${ userId }`, { email: 'haigryan@gmail.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email haigryan@gmail.com already in use')
        }
    })

    test('should return an error if the new username is already in use', async () => {
        try {
            await userClient.put(`/update/${ userId }`, { username: 'HaigRyan' })
        } catch(err) {
            expect(err.response.data.err).toBe('Username HaigRyan already in use')
        }
    })

    test('should return an error if password is passed in and password2 is not', async () => {
        try {
            await userClient.put(`/update/${ userId }`, { password: newUserData.password })
        } catch(err) {
            expect(err.response.data.err).toBe('Need to pass in password2 as well')
        }
    })

    test('should return an error if password and password2 do not match', async () => {
        try {
            await userClient.put(`/update/${ userId }`, { password: newUserData.password, password2: 'goNuggets15' })
        } catch(err) {
            expect(err.response.data.err).toBe('Passwords need to match')
        }
    })

    test('should update the user if only a username, password, or email is passed in', async () => {
        try {
            const res = await userClient.put(`/update/${ userId }`, { password: 'newPassword', password2: 'newPassword' })
            
            const { id, username, email, createdOn, authtoken, password } = res.data
            expect(id).toBe(userId)
            expect(username).toBe(userData.username)
            expect(email).toBe(userData.email)
            expect(password).toBe(undefined)
            expect(createdOn > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should update the user if all new data is passed in', async () => {
        try {
            const res = await userClient.put(`/update/${ userId }`, newUserData)

            const { id, username, email, createdOn, authtoken, password } = res.data

            expect(id).toBe(userId)
            expect(username).toBe(newUserData.username)
            expect(email).toBe(newUserData.email)
            expect(password).toBe(undefined)
            expect(createdOn > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err.response.data)
        }
    })

    test('should return an error if the old password is used on login', async () => {
        try {
            await axios.post(AUTH_URL, { password: userData.password, email: userData.email })
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should be able to log the user in with their new creds', async () => {
        try {
            const res = await axios.post(AUTH_URL, { password: newUserData.password, email: newUserData.email })
            
            const { id, username, email, created_on, authtoken } = res.data.user
            
            expect(id).toBe(userId)
            expect(username).toBe(newUserData.username)
            expect(email).toBe(newUserData.email)
            expect(created_on > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('DELETE /api/v1/users/delete/:userId', () => {
    test('should return an error if the userID is not a valid uuid', async () => {
        try {
            await userClient.delete(URL + '/delete/12345')
        } catch(err) {
            expect(err.response.data.err).toBe('userId 12345 is not a valid UUID')
        }
    })

    test('should return an error if the user is not found', async () => {
        try {
            await userClient.delete('/delete/e49ad339-244b-4264-8759-492736e71914')
        } catch(err) {
            expect(err.response.data.err).toBe('User e49ad339-244b-4264-8759-492736e71914 not found')
        }
    })

    test('should delete a user', async () => {
        try {
            const res = await userClient.delete(`/delete/${ userId }`)

            const { id, username, email, createdOn, authtoken } = res.data
            expect(id).toBe(userId)
            expect(username).toBe(newUserData.username)
            expect(email).toBe(newUserData.email)
            expect(createdOn > '2020-01-01').toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})