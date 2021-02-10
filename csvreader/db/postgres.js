const {Client, Pool} = require('pg');

const configOptions = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'dbsrv',
    database: 'bitcoin',
    password: process.env.DB_PASSWD,
    port: process.env.DB_PORT || 5432
}

const pool = new Pool(configOptions);
const client = new Client(configOptions)

module.exports = {pool, client};