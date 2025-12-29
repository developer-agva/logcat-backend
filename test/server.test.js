var app = require("../index")

describe('Auth Test', () => {

    var server;
    beforeEach(function () {
        console.log("test server listen")
        server = app.listen;

    });
    afterEach(function (done) {
        console.log("test server close")
        server.close;
        done();
    });
});


module.exports = [{
    _id: "624154039d41f6aa67c0cd93",
    name: "John Doe",
    email: ["saman.arshad97@gmail.com"],
    password: "test0000",
    tokens: [{
        access: 'auth',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjI0MTU0MDM5ZDQxZjZhYTY3YzBjZDkzIiwianRpIjoiN3VwWHB6TXlaQyIsImlhdCI6MTY1ODIwNjU3OSwiZXhwIjoxNjU5NTAyNTc5fQ.WbA690Ases7xK2Y0MCpOeXHSz0uRYun2vqII6AmBKHU'
    }],
    otp: "PZVKTU",
    password: "test0000",
    passwordVerify: `test00001`,
    projectCode: ['GR1BT', 'SBXMH', 'M2B92', "QU9D9"],
    //last index project code get from project created with test api  
    // router.post('/',isAuth,isSuperAdmin,createNewProject)
    newProjetDetails: {
        name: "test run project",
        description: "Testing for LogCat Server",
        device_type: ["Type 1", "Type 2"]
    },
    newLog: {
        version: "1.0.0",
        type: "001",
        log: {
            file: "test.kt",
            date: "2022-04-20 08:35:10",
            msg: "testing from neeraj",
            type: "error"
        },
        device: {
            did: "test",
            name: "test",
            manufacturer: "test",
            battery: null,
            os: {
                name: "Ubuntu 20.04",
                type: "linux"
            }
        }
    },
    alertData: {
        did: "10:EC:81:1C:12:71",
        type: "002",
        ack: [
            {
                msg: "Just testing alert API from neeraj",
                code: "ACK-01",
                timestamp: "2022-04-22 12:35:45"
            },

        ]
    }
    
}]