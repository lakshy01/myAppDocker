// Getting the environment varible for setting up the redis
const {redisHost,redisPort} = require('./keys');

const redis = require('redis');

// Setting up the redis client
const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

function isUgly(n) {
    if (n === 0) return false;
    while (n%5 === 0) {
        n/=5;
    }
    while(n%3 === 0) {
        n/=3;
    }
    while(n%2 === 0) {
        n/=2;
    }
    return n === 1;
}

sub.on('message',(channel,message) => {
    redisClient.hset('values',message,isUgly(parseInt(message)));
});

sub.subscribe('insert');