const axios = require('axios')

const { validUUID } = require('../util/regex')

const URL = 'http://localhost:4000/api/v1/calories'
const AUTH_URL = 'http://localhost:4000/api/v1/auth'
let client    // soon to be axios client

const logData = {
    userId: '84612c93-20b2-41d9-a8da-b96728710aad',
    food: 'Chicken and Rice',
    calories: 600,
    timeOfDay: 'Dinner'
}
const newLogData = {
    userId: '84612c93-20b2-41d9-a8da-b96728710aad',
    food: 'Bagel with Peanut Butter',
    calories: 800,
    timeOfDay: 'Lunch'
}
let newLogId = ''

describe('POST /api/v1/calories/createLog', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when no data is passed in', async () => {
        try {
            await client.post('/createLog', {})
        } catch(err) {
            const { errors } = err.response.data
            expect(errors[0].msg).toBe('userId is required')
            expect(errors[1].msg).toBe('food is required')
            expect(errors[2].msg).toBe('calories is required')
        }
    })

    test('should return an error when userId is not a valid UUID', async () => {
        try {
            await client.post('/createLog', { ...logData, userId: '12345-67-890' })
        } catch(err) {
            expect(err.response.data.err).toBe('userId 12345-67-890 is not a valid UUID')
        }
    })

    test('should return an error when the userId is not found', async () => {
        try {
            await client.post('/createLog', { ...logData, userId: '84612c93-20b2-41d9-a8da-b96728710ccc' })
        } catch(err) {
            expect(err.response.data.err).toBe('User 84612c93-20b2-41d9-a8da-b96728710ccc not found')
        }
    })

    test('should create a log for the given userId', async () => {
        try {
            const res = await client.post('/createLog', logData)

            const { logid, userid, food, calories, timeOfDay } = res.data
            newLogId = logid
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(logData.userId)
            expect(food).toBe(logData.food)
            expect(calories).toBe(logData.calories)
            expect(timeOfDay).toBe(logData.timeOfDay)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/calories/user/:userId', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when userId is not a valid UUID', async () => {
        try {
            await client.get(`/user/12345-67-890`)
        } catch(err) {
            expect(err.response.data.err).toBe('userId 12345-67-890 is not a valid UUID')
        }
    })

    test('should return an error when no logs are found', async () => {
        try {
            await client.get(`/user/84612c93-20b2-41d9-a8da-b96728710ccc`)
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLogs found for userId 84612c93-20b2-41d9-a8da-b96728710ccc')
        }
    })

    test('should return all logs for a valid userId', async () => {
        try {
            const res = await client.get(`/user/${ logData.userId }`)
            
            const { logid, userid, food, calories, timeOfDay } = res.data[0]
            expect(res.data.length).toBeGreaterThan(0)
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(logData.userId)
            expect(food).toBeTruthy()
            expect(timeOfDay).toBe(logData.timeOfDay)
            expect(typeof calories === 'number').toBe(true)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/calories/log/:logId', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when logId is not a valid UUID', async () => {
        try {
            await client.get(`/log/12345-67-890`)
        } catch(err) {
            expect(err.response.data.err).toBe('logId 12345-67-890 is not a valid UUID')
        }
    })

    test('should return an error when no log is found', async () => {
        try {
            await client.get(`/log/5e3acff9-c224-4daa-88cd-e631859ae363`)
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLog found for logId 5e3acff9-c224-4daa-88cd-e631859ae363')
        }
    })

    test('should return a single log', async () => {
        try {
            const res = await client.get(`/log/${ newLogId }`)

            const { logid, userid, food, calories, timeOfDay } = res.data
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(logData.userId)
            expect(food).toBe(logData.food)
            expect(calories).toBe(logData.calories)
            expect(timeOfDay).toBe(logData.timeOfDay)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('PUT /api/v1/calories/log/:logId', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when no new data is passed in', async () => {
        try {
            await client.put(`/log/5e3acff9-c224-4daa-88cd-e631859ae363`, {})
        } catch(err) {
            expect(err.response.data.err).toBe('need to pass in at least food or calories')
        }
    })

    test('should return an error when logId is not a valid UUID', async () => {
        try {
            await client.put(`/log/12345-67-890`, {})
        } catch(err) {
            expect(err.response.data.err).toBe('logId 12345-67-890 is not a valid UUID')
        }
    })

    test('should update a log if only 1 item is changed', async () => {
        try {
            const res = await client.put(`/log/${ newLogId }`, { calories: 200 })

            const { logid, userid, food, calories, timeOfDay } = res.data
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(newLogData.userId)
            expect(food).toBe(logData.food)
            expect(calories).toBe(200)
            expect(timeOfDay).toBe(logData.timeOfDay)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })

    test('should update a log if all items are changed', async () => {
        try {
            const res = await client.put(`/log/${ newLogId }`, newLogData)

            const { logid, userid, food, calories, timeOfDay } = res.data
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(newLogData.userId)
            expect(food).toBe(newLogData.food)
            expect(calories).toBe(newLogData.calories)
            expect(timeOfDay).toBe(logData.timeOfDay)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('DELETE /api/v1/calories/log/:logId', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error when logId is not a valid UUID', async () => {
        try {
            await client.get(`/log/12345-67-890`)
        } catch(err) {
            expect(err.response.data.err).toBe('logId 12345-67-890 is not a valid UUID')
        }
    })

    test('should return an error if no log is found', async () => {
        try {
            await client.get(`/log/5e3acff9-c224-4daa-88cd-e631859cc363`)
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLog found for logId 5e3acff9-c224-4daa-88cd-e631859cc363')
        }
    })

    test('should delete a log', async () => {
        try {
            const res = await client.delete(`/log/${ newLogId }`)

            const { logid, userid, food, calories, timeOfDay } = res.data
            expect(validUUID.test(logid)).toBe(true)
            expect(userid).toBe(newLogData.userId)
            expect(food).toBe(newLogData.food)
            expect(calories).toBe(newLogData.calories)
            expect(timeOfDay).toBe(logData.timeOfDay)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/calories/daterange/:begin/:end', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return an error id :begin is not a valid date', async () => {
        try {
            await client.get('/daterange/20-01-01/2021-01-01')
        } catch(err) {
            expect(err.response.data.err).toBe('20-01-01 is not a valid date')
        }
    })

    test('should return an error id :end is not a valid date', async () => {
        try {
            await client.get('/daterange/2010-01-01/22-01-01')
        } catch(err) {
            expect(err.response.data.err).toBe('22-01-01 is not a valid date')
        }
    })

    test('should return error if no logs are found', async () => {
        try {
            await client.get('/daterange/1980-01-01/1990-01-01')
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLogs found in range 1980-01-01 to 1990-01-01')
        }
    })

    test('should return logs within a valid daterange', async () => {
        try {
            const res = await client.get('/daterange/2020-01-01/2030-01-01')
            expect(res.data.length).toBeGreaterThan(0)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/calories/food/:foodName', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should return error if no similar food is found', async () => {
        try {
            await client.get('/food/qqqqq')
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLogs found for food qqqqq')
        }
    })

    test('should return "Chicken and Rice" when searching for "Rice"', async () => {
        try {
            const res = await client.get('/food/Rice')
            const chxRice = res.data.find(log => log.food === 'Chicken and Rice')
            
            expect(validUUID.test(chxRice.logid)).toBe(true)
            expect(res.data.length).toBeGreaterThan(0)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})

describe('GET /api/v1/calories/calorierange/:begin/:end', () => {
    beforeAll(async () => {
        const loginData = await axios.post(AUTH_URL, { password: 'password', email: 'haigryan@gmail.com' })

        client = axios.create({
            baseURL: URL,
            headers: {'Authorization': 'Bearer ' + loginData.data.jwt}
        })
    })

    test('should throw an error if begin or end is not a number', async () => {
        try {
            await client.get('/calorierange/yeet/200')
        } catch(err) {
            expect(err.response.data.err).toBe('yeet is not a valid number')
        }

        try {
            await client.get('/calorierange/200/jokic')
        } catch(err) {
            expect(err.response.data.err).toBe('jokic is not a valid number')
        }
    })

    test('should return error if no logs are found', async () => {
        try {
            await client.get('/calorierange/49999/50000')
        } catch(err) {
            expect(err.response.data.err).toBe('No calorieLogs found for range 49999 to 50000')
        }
    })

    test('should return logs within a valid calorieRange', async () => {
        try {
            const res = await client.get('/calorierange/50/5000')

            expect(res.data.length).toBeGreaterThan(1)
        } catch(err) {
            console.log('i hope you don\'t ever see this', err)
        }
    })
})