// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const profileUpdateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `windowMs`
    message: 'Too many update requests from this IP, please try again after 15 minutes.'
});

module.exports = profileUpdateLimiter;