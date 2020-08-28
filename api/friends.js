const router = require('express').Router()
const { check, validationResult } = require('express-validator')

const auth = require('../util/auth')

// @route   POST /api/v1/addFriend
// @desc    test route
// @access  Public
router.get('/addFriend', [
    check('newFriendEmail', 'newFriendEmail is required').exists()
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    
    const { db, jwt: { user }, body: { newFriendEmail } } = req

    // grab newFriendEmail data
    const newFriendData = await db.query(`
        select * from users where email = '${ newFriendEmail }'
    `)

    // if the newFriend does not exist, return error
    if(!newFriendData.rows.length) {
        return res.status(404).json({ err: `email ${ newFriendEmail } not found` })
    }

    // grab user's friend data
    const newFriendId = newFriendData.rows[0].id
    const userFriendData = await db.query(`
        select userId from friend where userId = '${ newFriendId }' or friend_id = '${ newFriendId }'
    `)

    // make sure the users aren't already friends, if they are return an error
    if(userFriendData.rows.length) {
        return res.status(400).json({ err: `${ user.email } and ${ newFriendEmail } are already friends` })
    }

    // add new friend log
    const newFriendLog = await db.query(`
        insert into friend (userId, friend_id) 
            values ('${ user.id }', '${ newFriendId }')
            returning 
                userId,
                friend_id as "friendId",
                confirmed,
                sent_at as "sentAt",
                confirmed_at as "confirmedAt"
    `)

    res.json({ msg: `Friend request has been sent to ${ newFriendEmail }`, newFriendLog: newFriendLog.rows[0] })
})

module.exports = router