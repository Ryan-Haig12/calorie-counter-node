const router = require('express').Router()
const { check, validationResult } = require('express-validator')

const { validUUID } = require('../util/regex')

const auth = require('../util/auth')

// @route   POST /api/v1/friends/addFriend
// @desc    Create a new friend log to simulate a friendship
// @access  Private
router.post('/addFriend', [
    check('newFriendEmail', 'newFriendEmail is Required').exists().isEmail()
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
        insert into friend (userId, friend_id, user_email, friend_email) 
            values ('${ user.id }', '${ newFriendId }', '${ user.email }', '${ newFriendData.rows[0].email }')
            returning 
                userId as "userId",
                friend_id as "friendId",
                confirmed,
                sent_at as "sentAt",
                confirmed_at as "confirmedAt",
                user_email as "userEmail",
                friend_email as "friendEmail"
    `)

    res.json({ msg: `Friend request has been sent to ${ newFriendEmail }`, newFriendLog: newFriendLog.rows[0] })
})

// @route   PUT /api/v1/friends/confirmFriend
// @desc    Confirm a friend request to become true friends
// @access  Private
router.put('/confirmFriend', [
    check('confirmedFriendEmail', 'confirmedFriendEmail is Required').exists(),
    check('confirmedFriendEmail', 'confirmedFriendEmail must be a valid email').isEmail()
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { db, body: { confirmedFriendEmail }, jwt: { user } } = req
    const userEmail = user.email

    // ensure that deletedFriendEmail exists
    const friendLogData = await db.query(`
        select * from friend 
            where '${ confirmedFriendEmail }' in (friend.user_email, friend_email)
            and '${ userEmail }' in (friend.user_email, friend_email)
    `)

    // if there is no friend record for the 2 emails, throw an error
    if(!friendLogData.rows.length) {
        return res.status(404).json({ err: `No friend record found for ${ confirmedFriendEmail } and ${ userEmail }` })
    }

    // if the 2 emails are already friends, throw an error
    if(friendLogData.rows[0].confirmed) {
        return res.status(400).json({ err: `Emails ${ confirmedFriendEmail } and ${ userEmail } are already friends` })
    }

    // confirm friend request
    const friendData = await db.query(`
        update friend 
            set confirmed = true
            where '${ confirmedFriendEmail }' in (friend.user_email, friend_email)
            and '${ userEmail }' in (friend.user_email, friend_email)
            returning 
                userid as "userId",
                friend_id as "friendId",
                confirmed,
                confirmed_at as "confirmedAt",
                sent_at as "sentAt",
                user_email as "userEmail",
                friend_email as "friendEmail"
    `)

    return res.json({ friendData: friendData.rows[0] })
})

// @route   DELETE /api/v1/friends/deleteFriend
// @desc    Delete a friend record in the friend table
// @access  Private
router.delete('/deleteFriend', [
    check('deletedFriendEmail', 'deletedFriendEmail is Required').exists(),
    check('deletedFriendEmail', 'deletedFriendEmail must be a valid Email').isEmail()
], auth, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { db, body: { deletedFriendEmail }, jwt: { user } } = req
    const userEmail = user.email

    // ensure that deletedFriendEmail exists
    const deletedFriendIdData = await db.query(`
        select * from friend 
            where '${ deletedFriendEmail }' in (friend.user_email, friend_email)
            and '${ userEmail }' in (friend.user_email, friend_email)
    `)

    // if the 2 emails are not already friends, throw an error
    if(!deletedFriendIdData.rows.length) {
        return res.status(404).json({ err: `No friend record found for ${ deletedFriendEmail } and ${ userEmail }` })
    }

    // delete friend
    const deletedData = await db.query(`
        delete from friend
            where '${ deletedFriendEmail }' in (friend.user_email, friend_email)
            and '${ userEmail }' in (friend.user_email, friend_email)
            returning 
                userid as "userId",
                friend_id as "friendId",
                confirmed,
                confirmed_at as "confirmedAt",
                sent_at as "sentAt",
                user_email as "userEmail",
                friend_email as "friendEmail"
    `)

    return res.json({ deletedData: deletedData.rows[0] })
})

module.exports = router