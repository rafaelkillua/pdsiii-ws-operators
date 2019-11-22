const mysql = require('mysql')
const util = require('util')

const connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
})

const query = util.promisify(connection.query).bind(connection)

connection.connect(err => err ? console.error(err) : console.log('MySQL connected'))

module.exports = query
