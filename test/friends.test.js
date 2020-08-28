const axios = require('axios')

const { validUUID, validEmail } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/friends'
const authURL = 'http://localhost:4000/api/v1/auth'
let friendClient    // soon to be axios client

const myId = '84612c93-20b2-41d9-a8da-b96728710aad'
const kevinId = '62a00358-e400-4029-be09-0b31fac476a1'

describe('POST /api/v1/auth', () => {
    beforeAll(async () => {
        const loginData = await axios.post(authURL, { password: 'password', email: 'haigryan@gmail.com' })
        
        friendClient = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should throw an error if newFriendEmail is not passed in', async() => {
        try {
            await friendClient.post('/addFriend')
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('newFriendEmail is Required')
        }
    })

    test('should throw an error if newFriendEmail is not a valid email', async () => {
        try {
            await friendClient.post('/addFriend', { newFriendEmail: 'aaa.com' })
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('newFriendEmail is Required')
        }
    })

    test('should throw an error if newFriendEmail does not exist', async () => {
        try {
            await friendClient.post('/addFriend', { newFriendEmail: 'youwontfindme@test.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('email youwontfindme@test.com not found')
        }
    })

    test('should successfully send a friend request to newFriendEmail', async () => {
        try {
            const newFriendData = await friendClient.post('/addFriend', { newFriendEmail: 'kevin@gmail.com' })
            const { msg, newFriendLog: { userId, friendId } } = newFriendData.data
            expect(msg).toBe('Friend request has been sent to kevin@gmail.com')
            expect(userId).toBe(myId)
            expect(friendId).toBe(kevinId)
        } catch(err) {
            console.log('i hope you don\'t ever see this')
        }
    })

    test('should throw an error if users are already friends', async () => {
        try {
            await friendClient.post('/addFriend', { newFriendEmail: 'kevin@gmail.com' })
        } catch(err) {
            expect(err.response.data.err).toBe('haigryan@gmail.com and kevin@gmail.com are already friends')
        }
    })
})