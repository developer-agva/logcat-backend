const redis = require("redis");
const url = require("url");

let redisClient;
if (process.env.REDISCLOUD_URL) {
  let redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisClient = redis.createClient(redisURL.port, redisURL.hostname, {
    no_ready_check: true,
  });
  redisClient.auth(redisURL.auth.split(":")[1]);
  // console.log(1)
} else {
  // console.log(2)
  redisClient = redis.createClient();
}
// console.log(11,redisClient.jti)

// const redis = require('redis');
// const redisClient = redis.createClient({ host: 'redis', port: 6379 });
module.exports = redisClient