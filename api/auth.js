const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { validEmail } = require('../util/regex')

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
        const data = await req.db.query(`select * from users where users.email = '${ req.body.email }'`)

        if(!data.rows[0]) {
            res.status = 404
            res.json({ error: `Email not found` })
            return
        }

        // if passwords do not match, return an error
        const passMatch = await bcrypt.compare(req.body.password, data.rows[0].password)
        
        if(!passMatch) {
            res.status = 400
            res.json({ error: `Email/password are not correct` })
            return
        }

        data.rows[0].password = undefined

        res.status(200).json(data.rows[0])
    } catch(err) {
        console.log(err)
    }
})

module.exports = router