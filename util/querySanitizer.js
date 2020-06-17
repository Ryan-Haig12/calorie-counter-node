const { alphaNumerical, twoDashesInRow } = require('./regex')

const querySanitizer = async (req, res, next) => {
    let flag = true
    let error = ''
    for(let i in req.body) {
        const term = req.body[i].replace(/\s/g, '')
        // if the key/value pair is alphaNumerical and a dash (-) does not appear twice in a row
        // alphaNumerical is to ensure *, ^, =, ", etc do not appear in the value
        // twoDashesInRow  is to ensure dashes dashes do not appear twice in a row, preventing the rest of the query from being commented out
        if(!alphaNumerical.test(term) || !twoDashesInRow.test(term)) {
            error = `"${ term }" is unacceptable`
            flag = false
        }
    }

    if(flag) {
        await next()
    } else {
        res.status = 400
        res.json(error)
    }
}

module.exports = querySanitizer