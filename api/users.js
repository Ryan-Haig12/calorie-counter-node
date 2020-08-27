const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

const auth = require('../util/auth')
const { validUUID } = require('../util/regex')
const { generateToken } = require('../util/jwt')

// @route   GET /api/v1/users/id/:userId
// @desc    Get user from db by userId
// @access  Public
router.get('/id/:userId', async ({ db, params }, res) => {
    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const data = await db.query(`select * from users where id = '${ params.userId }'`)

    if(!data.rows[0]) {
        return res.status(200).json({ err: `User ${ params.userId } not found` })
    }

    if(data.rows.length) data.rows[0].password = undefined

    res.status(200).json(data.rows[0])
})

// @route   GET /api/v1/users/userName/:userName
// @desc    Get user from db by userName
// @access  Public
router.get('/userName/:userName', async ({ db, params }, res) => {
    const data = await db.query(`select * from users where username ilike '${ params.userName }'`)

    if(!data.rows[0]) {
        res.status(200).json({ err: `User ${ params.userName } not found` })
    }

    if(data.rows.length) data.rows[0].password = undefined

    res.status(200).json(data.rows[0])
})

// @route   GET /api/v1/users/allData/:userId
// @desc    All user data from the db by id
// @access  Public
router.get('/allData/:userId', async ({ db, params }, res) => {
    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const userData = await db.query(`select * from users where id = '${ params.userId }'`)
    if(!userData.rows[0]) {
        return res.status(404).json({ err: `User ${ params.userId } not found` })
    }

    if(userData.rows.length) userData.rows[0].password = undefined

    const caloryData = await db.query(`select * from calorieLog where userid = '${ params.userId }' `)
    const exerciseData = await db.query(`select * from exerciseLog where userid = '${ params.userId }' `)

    const totals = {
        caloriesGained: 0,
        caloriesBurnt: 0,
        calorieLogs: caloryData.rows.length,
        exerciseLogs: exerciseData.rows.length
    }
    caloryData.rows.map(data => totals.caloriesGained += data.calories)
    exerciseData.rows.map(data => totals.caloriesBurnt += data.calories_burnt)
    totals.netCalories = totals.caloriesGained - totals.caloriesBurnt

    res.status(200).json({
        user: userData.rows[0],
        calories: caloryData.rows,
        exercise: exerciseData.rows,
        totals
    })
})

// @route   POST /api/v1/users/create
// @desc    Create a new user
// @access  Public
router.post('/create', [
    check('username', 'Username is Required').isLength({ min: 6, max: 40 }),
    check('email', 'Email is Required').isEmail(),
    check('password', 'Password is Required (Min 6, max 40 Characters)').isLength({ min: 6, max: 40 }),
    check('password2', 'Password2 is Required (Min 6, max 40 Characters)').isLength({ min: 6, max: 40 }),
    check('currentWeight', 'currentWeight is Required').isNumeric(),
    check('idealWeight', 'idealWeight is Required').isNumeric(),
    check('dailyCalorieIntake', 'dailyCalorieIntake is Required').isNumeric(),
    check('gender', 'gender is Required between 2 and 10 chars').isLength({ min: 2, max: 10 }),
    check('birthday', 'birthday is Required').exists(),
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const { db, body } = req
    const { username, email, currentWeight, idealWeight, age, gender, birthday, dailyCalorieIntake } = body

    // if email exists, return an error
    const emailExists = await db.query(`select * from users where email = '${ body.email }'`)
    if(emailExists.rows.length) {
        return res.status(400).json({ err: `Email ${ body.email } already in use` })
    }

    // if username exists, return an error
    const usernameExists = await db.query(`select * from users where username = '${ body.username }'`)
    if(usernameExists.rows.length) {
        return res.status(400).json({ err: `Username ${ body.username } already in use` })
    }

    // if passwords do not match, return an error
    if(body.password != body.password2) {
        return res.status(400).json({ err: 'passwords must match' })
    }

    // hash password for db storage
    const salt = await bcrypt.genSalt(8)
    const hash = await bcrypt.hash(body.password, salt)

    let newUser
    console.log(username, email, currentWeight, idealWeight, age, gender, birthday)
    try {
        // create user and return new user info
        newUser = await db.query(
            `
            insert into users (username, password, email, current_weight, ideal_weight, age, gender, birthday, daily_calorie_intake)
                values ('${ username }', '${ hash }', '${ email }', '${ currentWeight }', '${ idealWeight }', '${ age }', '${ gender }', '${ birthday }', '${ dailyCalorieIntake }')
            returning
                id, username, email, created_on as "createdOn", authtoken, current_weight as "currentWeight", ideal_weight as "idealWeight", daily_calorie_intake as "dailyCalorieIntake", age, gender, birthday
            `
        )
    } catch(err) {
        console.log(err)
    }

    const newJWT = generateToken({ user: newUser.rows[0] })

    res.status(200).json({ newUser: newUser.rows[0], jwt: newJWT })
})

// @route   PUT /api/v1/users/update/:userId
// @desc    Update a user
// @access  Private
router.put('/update/:userId', [
    check('email', 'Email is not valid').isEmail().optional(),
    check('username', 'Username is not valid').optional(),
    check('password', 'Password is Required (Min 6, max 40 Characters)').isLength({ min: 6, max: 40 }).optional(),
    check('password2', 'Password2 is Required (Min 6, max 40 Characters)').isLength({ min: 6, max: 40 }).optional()
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { db, body, params } = req

    if(!body.email && !body.password && !body.username) {
        return res.status(400).json({ err: 'Need to pass in at least one email, password, or username' })
    }

    if(body.password && !body.password2) {
        return res.status(400).json({ err: 'Need to pass in password2 as well' })
    }

    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const user = await db.query(`select * from users where id = '${ params.userId }' `)
    if(!user.rows[0]) return res.status(404).json({ err: `User ${ params.userId } not found` })

    // if email exists, return an error
    if(body.email) {
        const emailExists = await db.query(`select * from users where email = '${ body.email }'`)
        if(emailExists.rows.length) return res.status(400).json({ err: `Email ${ body.email } already in use` })
    }
    
    // if username exists, return an error
    if(body.username) {
        const usernameExists = await db.query(`select * from users where username = '${ body.username }'`)
        if(usernameExists.rows.length) {
            return res.status(400).json({ err: `Username ${ body.username } already in use` })
        }
    }
    

    // append all arguments into a query body
    let queryBody = ''
    if(body.username) queryBody += `username = '${ body.username }'`
    if(body.password) {
        if(body.password != body.password2) {
            return res.status(400).json({ err: `Passwords need to match` })
        }

        if(body.username) queryBody += ', '
        // hash password for db storage
        const salt = await bcrypt.genSalt(8)
        const hash = await bcrypt.hash(body.password, salt)
        queryBody += `password = '${ hash }'`
    }
    if(body.email) {
        if(body.username || body.password) queryBody += ', '
        queryBody += `email = '${ body.email }'`
    }

    const query = await db.query(`
        update users set ${ queryBody } where id = '${ params.userId }'
        returning id, username, email, created_on as "createdOn", authtoken
    `)

    res.status(200).json(query.rows[0])
})

// @route   DELETE /api/v1/users/delete/:userId
// @desc    Update a user
// @access  Private
router.delete('/delete/:userId', auth, async ({ db, params }, res) => {
    // if userId is not a valid uuid, throw an error
    if(!validUUID.test(params.userId)) {
        return res.status(400).json({ err: `userId ${ params.userId } is not a valid UUID` })
    }

    const data = await db.query(`select * from users where id = '${ params.userId }' `)
    // if user is not found, return error
    if(!data.rows.length) res.status(404).json({ err: `User ${ params.userId } not found` })

    // ensuring that the user truly wants to delete their account will be handled client side
    // delete the user
    const deletedUser = await db.query(`delete from users where id = '${ params.userId }' returning id, username, email, created_on as "createdOn", authtoken`)
    res.status(200).json(deletedUser.rows[0])
})

module.exports = router