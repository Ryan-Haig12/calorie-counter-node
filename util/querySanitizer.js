const { alphaNumerical, twoDashesInRow } = require('./regex')

const querySanitizer = async (req, res, next) => {
    let flag = true
    let error = ''
    let term = ''
    for(let i in req.body) {
        // do not check numbers for string behavior
        if(typeof req.body[i] != 'number') {
            term = req.body[i].replace(/\s/g, '')
        } else {
            term = req.body[i]
        }
        
        // if the key/value pair is alphaNumerical and a dash (-) does not appear twice in a row
        // alphaNumerical is to ensure *, ^, =, ", etc do not appear in the value
        // twoDashesInRow  is to ensure dashes dashes do not appear twice in a row, preventing the rest of the query from being commented out
        if(!alphaNumerical.test(term) || !twoDashesInRow.test(term)) {
            error = `"${ term }" body param is unacceptable`
            flag = false
        }
    }

    // ensure query params are fine as well
    req.path.split('/').map(param => {
        if(param.length && (!alphaNumerical.test(param) || !twoDashesInRow.test(param))) {
            error = `"${ param }" query param is unacceptable`
            flag = false
        }
    })

    if(flag) {
        await next()
    } else {
        res.status(400).json(error)
    }
}

module.exports = querySanitizer