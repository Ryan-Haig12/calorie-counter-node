const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { validEmail } = require('../util/regex')

const { generateToken } = require('../util/jwt')

// @route   POST /api/v1/auth
// @desc    Login route
// @access  Public
router.post('/', [
    check('email', 'Email is Required').exists(),
    check('password', 'Password is Required').isLength({ min: 6, max: 40 }),
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    if(!validEmail.test(req.body.email)) {
        return res.status(400).json({ err: 'Email must be valid' })
    }

    try {
        const data = await req.db.query(`
            select id, password, username, email, created_on as "createdOn", authtoken, current_weight as "currentWeight", ideal_weight as "idealWeight", daily_calorie_intake as "dailyCalorieIntake", age, gender, birthday
                from users 
                where 
                users.email = '${ req.body.email }'
        `)

        if(!data.rows[0]) {
            return res.status(404).json({ error: `Email not found` })
        }

        // if passwords do not match, return an error
        const passMatch = await bcrypt.compare(req.body.password, data.rows[0].password)
        
        if(!passMatch) {
            return res.status(400).json({ error: `Email/password are not correct` })
        }

        if(data.rows.length) data.rows[0].password = undefined

        const newJWT = generateToken({ user: data.rows[0] })

        res.status(200).json({ user: data.rows[0], jwt: newJWT })
    } catch(err) {
        console.log(err)
    }
})

module.exports = router