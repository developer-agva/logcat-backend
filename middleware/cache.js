// // const mcache = require('memory-cache');
// const redisClient = require('../config/redisInit');

// let lruTrack = []
// let lruTrackWR = []

// const profileCache = (lifetime) => {
//     return function cache(req, res, next) {

//         let key = req.user

//         redisClient.exists(key, (err, isExist) => {
//             if (err) {
//                 console.log("error checking keys from cache : ", err)
//             }
//             if (isExist) {

//                 redisClient.get(key, (err, cachedResponse) => {
//                     if (err) {
//                         console.log("error getting data from cache : ", err)
//                     }
//                     if (cachedResponse) {
//                         let index = lruTrack.indexOf(key)
//                         console.log('index if', index, key)
//                         !lruTrack.includes(key) && lruTrack.splice(index, 0, key)
//                         console.log("Reading data from cache only")
//                         console.log('lruTrack if cachedResp', lruTrack, lruTrack.length)
//                         return res.json(JSON.parse(cachedResponse))
//                     } else {
//                         let index = lruTrack.indexOf(key)
//                         console.log('index else', index, key)
//                         !lruTrack.includes(key) && lruTrack.splice(index, 0, key)
//                         res.sendWithCache = res.json
//                         res.json = (data) => {
//                             redisClient.setex(key, lifetime * 1000, JSON.stringify(data))
//                             console.log("Saved new data in cache !")
//                             res.sendWithCache(data)
//                         }
//                         console.log('lruTrack else cachedResp', lruTrack, lruTrack.length)
//                         next()
//                     }
//                 })


//             } else {

//                 if (lruTrack.length >= 5) {
//                     lruUid = lruTrack.shift()
//                     redisClient.del(lruUid)
//                     console.log('lruTrack if lru length exceeds', lruTrack, lruTrack.length)
//                 }

//                 lruTrack.push(key)
//                 console.log('lruTrack after push lru length exceeds', lruTrack, lruTrack.length)
//                 res.sendWithCache = res.json
//                 res.json = (data) => {
//                     redisClient.setex(key, lifetime * 1000, JSON.stringify(data))
//                     console.log("Saved new data in cache again")
//                     res.sendWithCache(data)
//                 }
//                 next()

//             }
//         })
//     }
// }

// const writeThroughCache = (lifetime) => {
//     return function cache(req, res, next) {

//         let key = `${req.params.project_code}_${lruTrackWR.length + 1}`
//         console.log('key', key)

//         if (lruTrackWR.length >= 10) {
//             lruUid = lruTrackWR.shift()
//             redisClient.del(lruUid)
//             console.log('lruTrackWR if lru length exceeds', lruTrackWR, lruTrackWR.length)
//             // next()
//         }

//         lruTrackWR.push(key)
//         console.log('lruTrackWR after push lru length exceeds', lruTrackWR, lruTrackWR.length)
//         res.sendWithCache = res.json
//         res.json = (data) => {
//             redisClient.setex(key, lifetime * 1000, JSON.stringify(data.data.logs))
//             console.log('logs', data.data.logs)
//             console.log("Saved new data in cache again")
//             res.sendWithCache(data)
//         }
//         next()
//     }
// }

// const readThroughCache = (lifetime) => {
//     return function cache(req, res, next) {
//         console.log('lruTrackWR',lruTrackWR)

//         redisClient.mget(lruTrackWR, (err, cachedResponse) => {
//             if (err) {
//                 console.log("error getting data from cache : ", err)
//             }
//             if (cachedResponse) {
//                 console.log("Reading data from cache only")
//                 // console.log(cachedResponse)
//                 req.cachedData = cachedResponse
//                 next()

//             } else next()
//         })
//     }
// }

// module.exports = {
//     profileCache,
//     writeThroughCache,
//     readThroughCache
// }