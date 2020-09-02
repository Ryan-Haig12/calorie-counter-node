const axios = require('axios')
const moment = require('moment')

const { validUUID, validEmail } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/friends'
const authURL = 'http://localhost:4000/api/v1/auth'
let friendClient    // soon to be axios client

const myData = {
    id: '84612c93-20b2-41d9-a8da-b96728710aad',
    email: 'haigryan@gmail.com',
    password: 'password'
}
const friendData = {
    id: '62a00358-e400-4029-be09-0b31fac476a1',
    email: 'kevin@gmail.com'
}

describe('POST /api/v1/friends/addFriend', () => {
    beforeAll(async () => {
        const loginData = await axios.post(authURL, { password: myData.password, email: myData.email })
        
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
            const newFriendData = await friendClient.post('/addFriend', { newFriendEmail: friendData.email })
            const { msg, newFriendLog: { userId, friendId, userEmail, friendEmail } } = newFriendData.data
            expect(msg).toBe(`Friend request has been sent to ${ friendData.email }`)
            expect(userId).toBe(myData.id)
            expect(friendId).toBe(friendData.id)
            expect(userEmail).toBe(myData.email)
            expect(friendEmail).toBe(friendData.email)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
            expect(0).toBe(1)
        }
    })

    test('should throw an error if users are already friends', async () => {
        try {
            await friendClient.post('/addFriend', { newFriendEmail: friendData.email })
        } catch(err) {
            expect(err.response.data.err).toBe(`${ myData.email } and ${ friendData.email } are already friends`)
        }
    })
})

describe('PUT /api/v1/friends/confirmFriend', () => {
    test('should throw an error if no email is passed in', async () => {
        try {
            await friendClient.put('/confirmFriend')
        } catch(err) {
            expect(err.response.data.errors[0].msg).toBe('confirmedFriendEmail is Required')
            expect(err.response.data.errors[1].msg).toBe('confirmedFriendEmail must be a valid email')
        }
    })

    test('should throw an error if invalid email is passed in', async () => {
        try {
            await friendClient.put('/confirmFriend', { confirmedFriendEmail: 'notAValidEmail' })
        } catch(err) {
            expect(err.response.data.errors[0].msg).toBe('confirmedFriendEmail must be a valid email')
        }
    })

    test('should throw an error if there is no friend record containing the given emails', async () => {
        try {
            await friendClient.put('/confirmFriend', { confirmedFriendEmail: 'wereNotFriends@test.com' })
        } catch(err) {
            expect(err.response.data.err).toBe(`No friend record found for wereNotFriends@test.com and ${ myData.email }`)
        }
    })

    test('should confirm a friend request', async () => {
        try {
            const res = await friendClient.put('/confirmFriend', { confirmedFriendEmail: friendData.email })
            const { userId, friendId, confirmed, confirmedAt, userEmail, friendEmail } = res.data.friendData
            expect(userId).toBe(myData.id)
            expect(friendId).toBe(friendData.id)
            expect(confirmed).toBe(true)
            expect(confirmedAt).toBe(null)
            expect(userEmail).toBe(myData.email)
            expect(friendEmail).toBe(friendData.email)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
            expect(0).toBe(1)
        }
    })

    test('should throw an error if emails are friends already', async () => {
        try {
            await friendClient.put('/confirmFriend', { confirmedFriendEmail: friendData.email })
        } catch(err) {
            expect(err.response.data.err).toBe(`Emails ${ friendData.email } and ${ myData.email } are already friends`)
        }
    })
})

describe('DELETE /api/v1/friends/deleteFriend', () => {
    test('should throw an error if a non valid email is passed in', async () => {
        try {
            await friendClient.delete('/deleteFriend', { data: { deletedFriendEmail: 'notReal.com' } })
        } catch(err) {
            expect(err.response.data.errors[0].msg).toBe('deletedFriendEmail must be a valid Email')
        }
    })

    test('should throw an error if there is no record of the 2 users being friends', async () => {
        try {
            await friendClient.delete('/deleteFriend', { data: { deletedFriendEmail: 'wereNotFriends@test.com' } })
        } catch(err) {
            expect(err.response.data.err).toBe(`No friend record found for wereNotFriends@test.com and ${ myData.email }`)
        }
    })

    test('should delete a friend record', async () => {
        try {
            const res = await friendClient.delete('/deleteFriend', { data: { deletedFriendEmail: friendData.email } })
            const { userId, friendId, confirmed, confirmedAt, userEmail, friendEmail } = res.data.deletedData
            expect(userId).toBe(myData.id)
            expect(friendId).toBe(friendData.id)
            expect(confirmed).toBe(true)
            expect(confirmedAt).toBe(null)
            expect(userEmail).toBe(myData.email)
            expect(friendEmail).toBe(friendData.email)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
            expect(0).toBe(1)
        }
    })
})