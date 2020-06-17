const { Client } = require('pg')

const client = new Client({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  port: 5432,
})

module.exports = client