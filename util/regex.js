const validUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const alphaNumerical = /^[a-zA-Z0-9-_.@]*$/
const twoDashesInRow = /^([a-zA-Z0-9]+[-]{1})*[a-zA-Z0-9@.]+$/
const validDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/

module.exports = { validUUID, validEmail, alphaNumerical, twoDashesInRow, validDate }