// Getting the environment varibles
const keys = require('./keys');

// Redis setup
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// Postgres setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});

pgClient.on('connect',(client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err))
});

// Express server setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Setting the express route handler
app.get('/values/all', async (req,res) => {
    const values = await pgClient.query("SELECT * from values");
    res.send(values.rows);
});

app.get('/values/current', async (req,res) => {
    redisClient.hgetall('values',(err,values)=>{
        res.send(values);
    });
});

app.post('/values', (req,res) => {
    const n = req.body.n;
    if (parseInt(n) > 40) { return res.status(402).send("Number too high"); }
    redisClient.hset('values',n,'Nothing yet');
    redisPublisher.publish('insert',n);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [n]);
    res.send({working: true})
});

app.listen(5000,() => { console.log("Listening on port 5000"); });