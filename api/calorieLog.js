const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const { validUUID, validDate } = require('../util/regex')

const auth = require('../util/auth')

// @route   POST /api/v1/calories/createLog
// @desc    Create a new Calorie Log
// @access  Private
router.post('/createLog', [
    check('userId', 'userId is required').exists(),
    check('food', 'food is required').exists(),
    check('calories', 'calories is required').exists(),
    check('timeOfDay', 'time of day is required').exists(),
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { db, body } = req

    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(body.userId)) {
        return res.status(400).json({ err: `userId ${ body.userId } is not a valid UUID` })
    }

    // if user does not exist, throw an error
    let user = await db.query(`select * from users where id = '${ body.userId }'`)
    if(!user.rows.length) {
        return res.status(404).json({ err: `User ${ body.userId } not found` })
    }

    user = user.rows[0]
    const newCalorieLog = await db.query(`
        insert into calorieLog (userId, food, calories, time_of_day) values ('${ body.userId }', '${ body.food }', ${ body.calories }, '${ body.timeOfDay }')
        returning
            logid,
            userid,
            food,
            calories,
            time_of_day as "timeOfDay",
            logged_at as "loggedAt"
    `)

    res.status(200).json(newCalorieLog.rows[0])
})

// @route   GET /api/v1/calories/user/:userId
// @desc    Get all calorie logs for a user by a given userId
// @access  Public
router.get('/user/:userId', async ({ db, params }, res) => {
    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const logs = await db.query(`select * from calorielog where userid = '${ params.userId }' `)
    if(!logs.rows.length) {
        return res.status(404).json({ err: `No calorieLogs found for userId ${ params.userId }` })
    }

    return res.status(200).json(logs.rows)
})

// @route   GET /api/v1/calories/log/:logId
// @desc    Get a single calorieLog by logId
// @access  Public
router.get('/log/:logId', async ({ db, params }, res) => {
    // if logId is not a valid uuid, throw an error
    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `logId ${ params.logId } is not a valid UUID` })
    }

    const log = await db.query(`select * from calorielog where logId = '${ params.logId }' `)
    if(!log.rows.length) {
        return res.status(404).json({ err: `No calorieLog found for logId ${ params.logId }` })
    }

    res.status(200).json(log.rows[0])
})

// @route   PUT /api/v1/calories/log/:logId
// @desc    Update calorie log
// @access  Private
router.put('/log/:logId', [
    check('food', 'food is required').optional(),
    check('calories', 'calories is required').optional(),
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { db, body, params } = req

    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `logId ${ params.logId } is not a valid UUID` })
    }

    if(!body.food && !body.calories) {
        return res.status(400).json({ err: 'need to pass in at least food or calories' })
    }

    // update the log
    let queryBody = ''
    if(body.food) queryBody += `food = '${ body.food }'`
    if(body.calories) {
        if(body.food) queryBody += `, `
        queryBody += `calories = ${ body.calories }`
    }
    const updatedLog = await db.query(`
        update calorielog set ${ queryBody } where logId = '${ params.logId }'
        returning
            logid,
            userid,
            food,
            calories,
            time_of_day as "timeOfDay",
            logged_at as "loggedAt"
    `)

    if(!updatedLog.rows.length) {
        return res.status(500).json({ err: 'error updating calorie log... I hope you never see this error message' })
    }

    res.status(200).json(updatedLog.rows[0])
})

// @route   DELETE /api/v1/calories/log/:logId
// @desc    Delete a calorie log by logId
// @access  Private
router.delete('/log/:logId', auth, async ({ db, params }, res) => {
    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `userId ${ params.logId } is not a valid UUID` })
    }

    const deletedLog = await db.query(`
        delete from calorielog where logid = '${ params.logId }' 
        returning
            logid,
            userid,
            food,
            calories,
            time_of_day as "timeOfDay",
            logged_at as "loggedAt"
    `)

    if(!deletedLog.rows.length) {
        return res.status(404).json({ err: `No calorieLogs found for logId ${ params.logId }` })
    }

    res.status(200).json(deletedLog.rows[0])
})

// @route   GET /api/v1/calories/daterange/:begin/:end
// @desc    Get all calorieLogs in a specific time frame.
// @access  Public
router.get('/daterange/:begin/:end', async ({ db, params }, res) => {
    if(!validDate.test(params.begin)) {
        return res.status(400).json({ err: `${ params.begin } is not a valid date` })
    }

    if(!validDate.test(params.end)) {
        return res.status(400).json({ err: `${ params.end } is not a valid date` })
    }

    const logs = await db.query(`select * from calorieLog where logged_at <= '${ params.end }' and logged_at >= '${ params.begin }'`)

    if(!logs.rows.length) {
        return res.status(404).json({ err: `No calorieLogs found in range ${ params.begin } to ${ params.end }` })
    }

    res.status(200).json(logs.rows)
})

// @route   GET /api/v1/calories/food/:foodName
// @desc    Get all calorieLogs by food name
// @access  Public
router.get('/food/:foodName', async ({ db, params }, res) => {
    const logs = await db.query(`select * from calorielog where food ilike '%${ params.foodName.toLowerCase() }%' `)

    if(!logs.rows.length) {
        return res.status(404).json({ err: `No calorieLogs found for food ${ params.foodName }` })
    }

    res.status(200).json(logs.rows)
})

// @route   GET /api/v1/calories/calorierange/:begin/:end
// @desc    Get all calorieLogs that fall in the given calorie range
// @access  Public
router.get('/calorierange/:begin/:end', async ({ db, params }, res) => {
    if(isNaN(params.begin)) {
        return res.status(400).json({ err: `${ params.begin } is not a valid number` })
    }

    if(isNaN(params.end)) {
        return res.status(400).json({ err: `${ params.end } is not a valid number` })
    }

    const logs = await db.query(`select * from calorieLog where calories <= ${ params.end } and calories >= ${ params.begin }`)

    if(!logs.rows.length) {
        return res.status(400).json({ err: `No calorieLogs found for range ${ params.begin } to ${ params.end }` })
    }

    res.status(200).json(logs.rows)
})

module.exports = router