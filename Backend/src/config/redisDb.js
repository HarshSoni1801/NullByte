const { createClient } =require('redis');
require('dotenv').config();
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD, 
    socket: {
        host: 'redis-16439.c85.us-east-1-2.ec2.cloud.redislabs.com:16439',
        port: 12036
    }
});

module.exports=redisClient
