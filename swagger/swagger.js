const definitions = require('./definitions')
const paths = require('./paths/index')
const tags = require('./tags')

module.exports = {
    openapi: '3.0.0',
    host: 'localhost:4000',
    basePath: '/',
    info: {
      version: '1.0.0',
      title: 'Calorie Counter',
      description: 'Calorie Counter Node/Express API',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    components: {
        securitySchemes: {
            bearerJWT: {
                type: 'http',
                description: 'JWT to use protected routes. Use **POST /api/v1/users/create** to create a user in order to access protected routes. Use **POST /api/v1/auth** to authenticate your user and get your JWT. You only need to paste the JWT. There is no need to write \'Bearer\' inside of the input box.',
                scheme: 'bearer',
                in: 'header',
                name: 'Authorization'
            }
        }
    },
    security: [{
        bearerJWT: []
    }],
    ...definitions,
    ...paths,
    ...tags,
}