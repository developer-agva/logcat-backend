const path = require("path")
var request = require("supertest");
var baseUrl = "http://localhost:8000/api/logger/logs";
var projectDetail = require("./server.test")
var activeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjI0MTU0MDM5ZDQxZjZhYTY3YzBjZDkzIiwianRpIjoiN3VwWHB6TXlaQyIsImlhdCI6MTY1ODIwNjU3OSwiZXhwIjoxNjU5NTAyNTc5fQ.WbA690Ases7xK2Y0MCpOeXHSz0uRYun2vqII6AmBKHU'


describe('LOGS test', () => {



    describe('GET REQUEST', () => {

        it("Unsuccessful operation : GET ALL LOGS", (done) => {
            request(`${baseUrl}`)
                .get(`/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required query fields missing : GET ALL LOGS", (done) => {
            request(`${baseUrl}`)
                .get(`/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation : GET ALL LOGS", (done) => {
            request(`${baseUrl}`)
                .get(`/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });


        it("Successful operation with filtered results : GET ALL LOGS", (done) => {
            request(`${baseUrl}`)
                .get(`/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ sort: 'logMsg' })
                .query({ limit: '25' })
                .query({ page: '1' })
                .query({ logType: 'error' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });


        // GET LOGS BY LOGTYPE
        it("Unsuccessful operation with no token : GET LOG TYPES DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/getLogsCount/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required project code missing / incorrect : GET ALL LOGS TYPE DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/getLogsCount/`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required query fields missing : GET ALL LOGS TYPE DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/getLogsCount/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation : GET LOG TYPES DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/getLogsCount/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        // DATE WISE LOGCOUNT WITH PROJECT CODE

        it("Unsuccessful operation with no token : DATEWISE LOG COUNT", (done) => {
            request(`${baseUrl}`)
                .get(`/datewiselogcount/${projectDetail[0].projectCode[1]}`)
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required fields missing : DATEWISE LOG COUNT", (done) => {
            request(`${baseUrl}`)
                .get(`/datewiselogcount/${projectDetail[0].projectCode[1]}`)
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation : DATEWISE LOG COUNT", (done) => {
            request(`${baseUrl}`)
                .get(`/datewiselogcount/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        // CREASH FREE USER DATEWISE WITH PROJECT CODE


        it("Unsuccessful operation with no token : CRASHFREE USERS", (done) => {
            request(`${baseUrl}`)
                .get(`/crashfree-users-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required fields missing : CRASHFREE USERS", (done) => {
            request(`${baseUrl}`)
                .get(`/crashfree-users-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });


        it("Successful operation : CRASHFREE USERS", (done) => {
            request(`${baseUrl}`)
                .get(`/crashfree-users-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        //  GET ALERTS WITH FILTER
        it("Unsuccessful operation with no token : GET ALL ALERTS", (done) => {
            request(`${baseUrl}`)
                .get(`/alerts/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Required fields missing : GET ALL ALERTS", (done) => {
            request(`${baseUrl}`)
                .get(`/alerts/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation with filtered results : GET ALL ALERTS", (done) => {
            request(`${baseUrl}`)
                .get(`/alerts/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ sort: 'logMsg' })
                .query({ limit: '25' })
                .query({ page: '1' })
                .query({ logType: 'error' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Sucessful operation : GET ALL ALERTS", (done) => {
            request(`${baseUrl}`)
                .get(`/alerts/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-25' })
                .query({ endDate: '2022-04-25' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });


        // GET CRASHLYTICS DATA WITH PROJECT TYPE
        it("Unsuccessful operation with no token : GET CRASHLYTICS DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/get-crashlytics-data/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation : GET CRASHLYTICS DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/get-crashlytics-data/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ logMsg: 'java.lang.Integer.parseInt(Integer.java:608' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation with date filter : GET CRASHLYTICS DATA", (done) => {
            request(`${baseUrl}`)
                .get(`/get-crashlytics-data/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-01-01' })
                .query({ endDate: '2022-04-04' })
                .query({ logMsg: 'java.lang.Integer.parseInt(Integer.java:608' })

                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });


        // GET LOG OCCURANCE DATEWISE WITH PROJECT CODE
        it("Unsuccessful operation with no token : GET LOG OCCURRENCES DATEWISE", (done) => {
            request(`${baseUrl}`)
                .get(`/log-occurrences-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation : GET LOG OCCURRENCES DATEWISE", (done) => {
            request(`${baseUrl}`)
                .get(`/log-occurrences-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ logMsg: 'java.lang.Integer.parseInt(Integer.java:608' })
                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

        it("Successful operation with date filter : GET LOG OCCURRENCES DATEWISE", (done) => {
            request(`${baseUrl}`)
                .get(`/log-occurrences-datewise/${projectDetail[0].projectCode[1]}`)
                .query({ projectType: '001' })
                .query({ startDate: '2022-02-12' })
                .query({ endDate: '2022-05-13' })
                .query({ logMsg: 'java.lang.Integer.parseInt(Integer.java:608' })

                .set(
                    "Authorization",
                    `Bearer ${activeToken} `
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    })


    describe('POST REQUEST', () => { 
        
        // it("Unsuccessful operation with invalid request body : CREATE LOGS", (done) => {
        //     request(`${baseUrl}`)
        //         .post(`/${projectDetail[0].projectCode[1]}`)
        //         .send({
        //             version: projectDetail[0].newLog.version,
        //             type: projectDetail[0].newLog.type,
        //             log: {
        //                 file: "",
        //                 date: projectDetail[0].newLog.log.date,
        //                 msg: projectDetail[0].newLog.log.msg,
        //                 type: projectDetail[0].newLog.log.type
        //             },
        //             device: {
        //                 did: projectDetail[0].newLog.device.did,
        //                 name: projectDetail[0].newLog.device.did,
        //                 manufacturer: projectDetail[0].newLog.device.did,
        //                 battery: projectDetail[0].newLog.device.battery,
        //                 os: {
        //                     name: projectDetail[0].newLog.device.os.name,
        //                     type: projectDetail[0].newLog.device.os.type
        //                 }
        //             }
        //         })
        //         .expect(500)
        //         .end(function (err, res) {
        //             console.log('res',res.text,res.statusCode)
        //             if (err) return done(err);
        //             return done();
        //         });
        // });
    
        it("Unsuccessful operation with invalid request body : CREATE LOGS", (done) => {
            request(`${baseUrl}`)
                .post(`/${projectDetail[0].projectCode[1]}`)
                .send({
                    version: projectDetail[0].newLog.version,
                    type: projectDetail[0].newLog.type,
                    log: {
                        file: projectDetail[0].newLog.log.file,
                        date: "",
                        msg: projectDetail[0].newLog.log.msg,
                        type: projectDetail[0].newLog.log.type
                    },
                    device: {
                        did: projectDetail[0].newLog.device.did,
                        name: projectDetail[0].newLog.device.did,
                        manufacturer: projectDetail[0].newLog.device.did,
                        battery: projectDetail[0].newLog.device.battery,
                        os: {
                            name: projectDetail[0].newLog.device.os.name,
                            type: projectDetail[0].newLog.device.os.type
                        }
                    }
                })
                .expect(500)
                .end(function (err, res) {
    
                    if (err) return done(err);
                    return done();
                });
        });
    
        it("Successful operation : CREATE LOGS", (done) => {
            request(`${baseUrl}`)
                .post(`/${projectDetail[0].projectCode[1]}`)
                .send({
                    version: projectDetail[0].newLog.version,
                    type: projectDetail[0].newLog.type,
                    log: {
                        file: projectDetail[0].newLog.log.file,
                        date: projectDetail[0].newLog.log.date,
                        msg: projectDetail[0].newLog.log.msg,
                        type: projectDetail[0].newLog.log.type
                    },
                    device: {
                        did: projectDetail[0].newLog.device.did,
                        name: projectDetail[0].newLog.device.did,
                        manufacturer: projectDetail[0].newLog.device.did,
                        battery: projectDetail[0].newLog.device.battery,
                        os: {
                            name: projectDetail[0].newLog.device.os.name,
                            type: projectDetail[0].newLog.device.os.type
                        }
                    }
                })
    
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
    
        it("should not create log in v2 route project type where file is missing or empty send in body", (done) => {
            request(`${baseUrl}`)
                .post(`/v2/${projectDetail[0].projectCode[1]}`)
                .send({
                    version: projectDetail[0].newLog.version,
                    type: projectDetail[0].newLog.type,
                    log: {
                        file: "",
                        date: projectDetail[0].newLog.log.date,
                        msg: projectDetail[0].newLog.log.msg,
                        type: projectDetail[0].newLog.log.type
                    },
                    device: {
                        did: projectDetail[0].newLog.device.did,
                        name: projectDetail[0].newLog.device.did,
                        manufacturer: projectDetail[0].newLog.device.did,
                        battery: projectDetail[0].newLog.device.battery,
                        os: {
                            name: projectDetail[0].newLog.device.os.name,
                            type: projectDetail[0].newLog.device.os.type
                        }
                    }
                })
                .expect(500)
                .end(function (err, res) {
    
                    if (err) return done(err);
                    return done();
                });
        });
    
    
        it("should not create log with v2 route", (done) => {
            request(`${baseUrl}`)
                .post(`/v2/${projectDetail[0].projectCode[1]}`)
                .send({
                    version: projectDetail[0].newLog.version,
                    type: projectDetail[0].newLog.type,
                    log: {
                        file: projectDetail[0].newLog.log.file,
                        date: projectDetail[0].newLog.log.date,
                        msg: projectDetail[0].newLog.log.msg,
                        type: projectDetail[0].newLog.log.type
                    },
                    device: {
                        did: projectDetail[0].newLog.device.did,
                        name: projectDetail[0].newLog.device.did,
                        manufacturer: projectDetail[0].newLog.device.did,
                        battery: projectDetail[0].newLog.device.battery,
                        os: {
                            name: projectDetail[0].newLog.device.os.name,
                            type: projectDetail[0].newLog.device.os.type
                        }
                    }
                })
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
    
        it("should create log with v2 route", (done) => {
            request(`${baseUrl}`)
                .post(`/v2/${projectDetail[0].projectCode[1]}`)
                .send({
                    version: projectDetail[0].newLog.version,
                    type: projectDetail[0].newLog.type,
                    log: {
                        file: projectDetail[0].newLog.log.file,
                        date: projectDetail[0].newLog.log.date,
                        msg: projectDetail[0].newLog.log.msg,
                        type: projectDetail[0].newLog.log.type
                    },
                    device: {
                        did: projectDetail[0].newLog.device.did,
                        name: projectDetail[0].newLog.device.name,
                        manufacturer: projectDetail[0].newLog.device.manufacturer,
                        battery: projectDetail[0].newLog.device.battery,
                        os: {
                            name: projectDetail[0].newLog.device.os.name,
                            type: projectDetail[0].newLog.device.os.type
                        }
                    }
                })
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
        // it("should create log with v2 route with form data", (done) => {
        //     request(`${baseUrl}`)
        //         .post(`/v2/${projectDetail[0].projectCode[1]}`)
        //         .field('version', projectDetail[0].newLog.version)
        //         .field('type', projectDetail[0].newLog.type)
        //         .field('did', projectDetail[0].newLog.device.did)
        //         .field('deviceName', projectDetail[0].newLog.device.name)
        //         .field('manufacturer', projectDetail[0].newLog.device.manufacturer)
        //         .field('osName', projectDetail[0].newLog.device.os.name)
        //         .field('osType', projectDetail[0].newLog.device.os.type)
        //         .attach('filePath', path.resolve(__dirname, './img.jpg'))
        //         .expect(201)
        //         .end(function (err, res) {
        //                //             if (err) return done(err);
        //             return done();
        //         });
        // });
    
    
        it("should not create alerts project type where did not defind or invalid", (done) => {
            request(`${baseUrl}`)
                .post(`/alerts/${projectDetail[0].projectCode[1]}`)
                .send({
                    did: "",
                    type: projectDetail[0].alertData.type,
                    ack: [
                        {
                            msg: projectDetail[0].alertData.ack[0].msg,
                            code: projectDetail[0].alertData.ack[0].code,
                            timestamp: projectDetail[0].alertData.ack[0].timestamp
                        },
    
                    ]
                })
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
        it("should not create alerts project type where code and timestamp not defind or invalid", (done) => {
            request(`${baseUrl}`)
                .post(`/alerts/${projectDetail[0].projectCode[1]}`)
                .send({
                    did: projectDetail[0].alertData.did,
                    type: projectDetail[0].alertData.type,
                    ack: [
                        {
                            msg: projectDetail[0].alertData.ack[0].msg,
                            code: "",
                            timestamp: ""
                        },
    
                    ]
                })
    
    
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
        it("should not create alerts project type where project type not defind or invalid", (done) => {
            request(`${baseUrl}`)
                .post(`/alerts/${projectDetail[0].projectCode[1]}`)
                .send({
                    did: projectDetail[0].alertData.did,
                    type: "",
                    ack: [
                        {
                            msg: projectDetail[0].alertData.ack[0].msg,
                            code: projectDetail[0].alertData.ack[0].code,
                            timestamp: projectDetail[0].alertData.ack[0].timestamp
                        },
    
                    ]
                })
    
    
                .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    
    
        it("should create alerts project type", (done) => {
            request(`${baseUrl}`)
                .post(`/alerts/${projectDetail[0].projectCode[1]}`)
                .send({
                    did: projectDetail[0].alertData.did,
                    type: projectDetail[0].alertData.type,
                    ack: [
                        {
                            msg: projectDetail[0].alertData.ack[0].msg,
                            code: projectDetail[0].alertData.ack[0].code,
                            timestamp: projectDetail[0].alertData.ack[0].timestamp
                        },
    
                    ]
                })
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });

     })
})
