const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    // get token from header
    let token = req.header('Authorization')

    // check if token exists
    if(!token) {
        return res.status(401).json({ err: 'No Token, auth denied' })
    }

    token = token.split(' ')[1] // remove 'Bearer'

    // If the token has not stripped the secret code, remove the secret code
    // I copy/pasted this whole file from another project, not sure if this is needed?
    //if(token && token.includes(',')) token = token.split(',')[0]
    
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.jwt = decoded
        next()
    } catch(err) {
        res.status(401).json({ err: 'Token is invalid' })
    }

}