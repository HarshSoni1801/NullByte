const { createClient } =require('redis');
require('dotenv').config();
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD, 
    socket: {
        host: 'redis-12036.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 12036
    }
});

module.exports=redisClient