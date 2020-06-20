const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const { validUUID, validDate } = require('../util/regex')

// @route   POST /api/v1/exercise/createLog
// @desc    Create a new exercise Log
// @access  Public
router.post('/createLog', [
    check('userId', 'userId is required').exists(),
    check('activity', 'activity is required').exists(),
    check('calories_burnt', 'calories_burnt is required').exists(),
], async (req, res) => {
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
    const newExerciseLog = await db.query(`
        insert into exerciseLog (userId, activity, calories_burnt) values ('${ body.userId }', '${ body.activity }', ${ body.calories_burnt })
        returning
            logid,
            userid,
            activity,
            calories_burnt  as "caloriesBurnt",
            logged_at       as "loggedAt"
    `)

    res.status(200).json(newExerciseLog.rows[0])
})

// @route   GET /api/v1/exercise/user/:userId
// @desc    Get all exercise logs for a user by a given userId
// @access  Public
router.get('/user/:userId', async ({ db, params }, res) => {
    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const logs = await db.query(`select * from exerciseLog where userid = '${ params.userId }' `)
    if(!logs.rows.length) {
        return res.status(404).json({ err: `No exerciseLogs found for userId ${ params.userId }` })
    }

    return res.status(200).json(logs.rows)
})

// @route   GET /api/v1/exercise/log/:logId
// @desc    Get a single exerciseLog by logId
// @access  Public
router.get('/log/:logId', async ({ db, params }, res) => {
    // if logId is not a valid uuid, throw an error
    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `logId ${ params.logId } is not a valid UUID` })
    }

    const log = await db.query(`select * from exerciselog where logId = '${ params.logId }' `)
    if(!log.rows.length) {
        return res.status(404).json({ err: `No exerciseLog found for logId ${ params.logId }` })
    }

    res.status(200).json(log.rows[0])
})

// @route   PUT /api/v1/exercise/log/:logId
// @desc    Update exercise log
// @access  Public
router.put('/log/:logId', async ({ db, body, params }, res) => {
    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `logId ${ params.logId } is not a valid UUID` })
    }

    if(!body.calories_burnt && !body.activity) {
        return res.status(400).json({ err: `need to pass in at least calories_burnt or activity` })
    }

    // update the log
    let queryBody = ''
    if(body.activity) queryBody += `activity = '${ body.activity }'`
    if(body.calories_burnt) {
        if(body.activity) queryBody += `, `
        queryBody += `calories_burnt = ${ body.calories_burnt }`
    }
    const updatedLog = await db.query(`
        update exerciselog set ${ queryBody } where logId = '${ params.logId }'
        returning
            logid,
            userid,
            calories_burnt  as "caloriesBurnt",
            activity,
            logged_at       as "loggedAt"
    `)

    if(!updatedLog.rows.length) {
        return res.status(500).json({ err: 'error updating exercise log... I hope you never see this error message' })
    }

    res.status(200).json(updatedLog.rows[0])
})

// @route   DELETE /api/v1/exercise/log/:logId
// @desc    Delete a calorie log by logId
// @access  Public
router.delete('/log/:logId', async ({ db, params }, res) => {
    if(!validUUID.test(params.logId)) {
        return res.status(400).json({ err: `userId ${ params.logId } is not a valid UUID` })
    }

    const deletedLog = await db.query(`
        delete from exerciselog where logid = '${ params.logId }' 
        returning
            logid,
            userid,
            activity,
            calories_burnt  as "caloriesBurnt",
            logged_at       as "loggedAt"
    `)

    if(!deletedLog.rows.length) {
        return res.status(404).json({ err: `No calorieLogs found for id ${ params.logId }` })
    }

    res.status(200).json(deletedLog.rows[0])
})

// @route   GET /api/v1/exercise/daterange/:begin/:end
// @desc    Get all exerciseLogs in a specific time frame.
// @access  Public
router.get('/daterange/:begin/:end', async ({ db, params }, res) => {
    if(!validDate.test(params.begin)) {
        return res.status(400).json({ err: `${ params.begin } is not a valid date` })
    }

    if(!validDate.test(params.end)) {
        return res.status(400).json({ err: `${ params.end } is not a valid date` })
    }

    const logs = await db.query(`select * from exerciseLog where logged_at <= '${ params.end }' and logged_at >= '${ params.begin }'`)

    res.status(200).json(logs.rows)
})

// @route   GET /api/v1/exercise/activity/:activityName
// @desc    Get all exerciseLogs by activity name
// @access  Public
router.get('/activity/:activityName', async ({ db, params }, res) => {
    const logs = await db.query(`select * from exerciselog where activity ilike '%${ params.activityName.toLowerCase() }%' `)

    if(!logs.rows.length) {
        return res.status(404).json({ err: `No exerciseLogs found for activity ${ params.activityName }` })
    }

    res.status(200).json(logs.rows)
})

// @route   GET /api/v1/exercise/calorierange/:begin/:end
// @desc    Get all exerciseLogs that fall in the given calorie range
// @access  Public
router.get('/calorierange/:begin/:end', async ({ db, params }, res) => {
    if(isNaN(params.begin)) {
        return res.status(400).json({ err: `${ params.begin } is not a valid number` })
    }

    if(isNaN(params.end)) {
        return res.status(400).json({ err: `${ params.end } is not a valid number` })
    }

    const logs = await db.query(`select * from exerciseLog where calories_burnt <= ${ params.end } and calories_burnt >= ${ params.begin }`)

    if(!logs.rows.length) {
        return res.status(400).json({ err: `No exerciseLogs found for range ${ params.begin } to ${ params.end }` })
    }

    res.status(200).json(logs.rows)
})

module.exports = router