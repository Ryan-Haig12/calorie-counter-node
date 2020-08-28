const axios = require('axios')

const { validUUID, validEmail } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/auth'
let authClient    // soon to be axios client

describe('POST /api/v1/auth', () => {
    beforeAll(async () => {
        const loginData = await axios.post(URL, { password: 'password', email: 'haigryan@gmail.com' })

        authClient = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when no data is sent', async () => {
        try {
            await authClient.post('/')
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Email is Required')
            expect(errors[1].msg).toBe('Password is Required')
        }
    })

    test('should return an error when no email is sent', async () => {
        try {
            await authClient.post('/', { password: 'password' })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Email is Required')
        }
    })

    test('should return an error when no password is sent', async () => {
        try {
            await authClient.post('/', { email: 'haigryan@gmail.com' })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('Password is Required')
        }
    })

    test('should return an error when no email is not a valid email', async () => {
        try {
            await authClient.post('/', { password: 'password', email: 'email.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email must be valid')
        }

        try {
            await authClient.post('/', { password: 'password', email: 'email@testcom' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email must be valid')
        }

        try {
            await authClient.post('/', { password: 'password', email: 'emailtestcom' })
        } catch(err) {
            expect(err.response.data.err).toBe('Email must be valid')
        }
    })

    test('should return an error when email is not found', async () => {
        try {
            const res = await authClient.post('/', { password: 'password', email: 'youWontFindMe@haig.com' })
            expect(res.data.error).toBe('Email not found')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should return an error when email and password do not match', async () => {
        try {
            const res = await authClient.post('/', { password: 'notMyPassword', email: 'haigryan@gmail.com' })
            expect(res.data.error).toBe('Email/password are not correct')
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should successfully auth a user', async () => {
        try {
            const res = await authClient.post('/', { password: 'password', email: 'haigryan@gmail.com' })
            
            const { id, username, password, email, authtoken } = res.data.user
            expect(validUUID.test(id)).toBe(true)
            expect(username).toBe('HaigRyan')
            expect(email).toBe('haigryan@gmail.com')
            expect(password).toBe(undefined)
            expect(validEmail.test(email)).toBe(true)
            expect(validUUID.test(authtoken)).toBe(true)
            expect(res.data.jwt).toBeTruthy()
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})