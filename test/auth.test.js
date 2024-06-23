var request = require('supertest');

// BDD -> behaviour driven development
// AAA -> act , assertion , action
var baseUrl = 'http://localhost:8000/api/logger';
var user = require("./server.test")

// describe('AUTH & USER MODULE', () => {

//     describe('POST REQUEST', () => {
//         it('Required credentials missing : LOGIN', function (done) {
//             request(baseUrl)
//                 .post('/auth/login')
//                 .send({ email: "", password: "" })
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });
//         /**
//         * @route -> validation routes for login email invalid
//         */

//         it('Invalid data : LOGIN', (done) => {
//             request(baseUrl)
//                 .post(`/auth/login`)
//                 .send({ email: "123", password: user[0].password })
//                 .expect('Content-Type', /json/)
//                 .expect(404)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Successful operation : LOGIN', (done) => {
//             request(baseUrl)
//                 .post(`/auth/login`)
//                 .expect('Content-Type', "application/json; charset=utf-8")
//                 .send({ email: user[0].email, password: user[0].password })
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     done();
//                 });
//         })
//         it('Required fields missing : SIGNUP', function (done) {
//             request(baseUrl)
//                 .post('/auth/register')
//                 .send({ name: "", email: "", password: "" })
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });


//         it('Data already exists : SIGNUP', (done) => {
//             request(baseUrl)
//                 .post(`/auth/register`)
//                 .send({ name: user[0].name, email: user[0].email, password: user[0].password })
//                 .expect('Content-Type', /json/)
//                 .expect(409)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         /**
//          * @route -> validation routes for register email invalid
//          */

//         it('Invalid data : SIGNUP', (done) => {
//             request(baseUrl)
//                 .post(`/auth/register`)
//                 .send({ name: user[0].name, email: "123", password: user[0].password })
//                 .expect('Content-Type', /json/)
//                 .expect(500)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })
//         // please check if user run this route so user will create on the database as well
//         /**
//          * @note -> delete the created user from database and try again
//          * uncomment to run this route for testing purpose only 
//          */
//         // it('should user register with new user', (done) => {
//         //     var newUser = {
//         //         name: "test",
//         //         email: "test@gmail.com",
//         //         password: "test1111"
//         //     }
//         //     request(baseUrl)
//         //         .post(`/auth/register`)
//         //         .send({ name: newUser.name, email: newUser.email, password: newUser.password })
//         //         .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//         //         .expect('Content-Type', /json/)
//         //         .expect(201)

//         //         .end(function (err, res) {
//         //             if (err) return done(err);
//         //             return done();
//         //         });
//         // })


//         it('Successful operation : FORGOT PWD', (done) => {
//             request(baseUrl)
//                 .post(`/auth/forget`)
//                 .send({ email: user[0].email, })
//                 .expect('Content-Type', /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Passwords not matching : RESET PWD', (done) => {
//             request(baseUrl)
//                 .post(`/auth/resetPassword`)
//                 .send({
//                     otp: "T1VJBX",
//                     email: user[0].email,
//                     // otp from custome user created at top  -> valid otp from email for one time 
//                     // need to paste the otp here from email for work this route fine
//                     password: "test_",
//                     passwordVerify: "test",
//                 })
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Required fields missing : RESET PWD', (done) => {
//             500
//             request(baseUrl)
//                 .post(`/auth/resetPassword`)
//                 .send({
//                     otp: "T1VJBX",
//                     email: user[0].email,
//                     // otp from custome user created at top  -> valid otp from email for one time 
//                     // need to paste the otp here from email for work this route fine
//                     password: "",
//                     passwordVerify: "",
//                 })
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Successful Operation : RESET PWD', (done) => {
//             request(baseUrl)
//                 .post(`/auth/resetPassword`)
//                 .send({
//                     otp: "T1VJBX",
//                     email: user[0].email,
//                     // otp from custome user created at top  -> valid otp from email for one time 
//                     // need to paste the otp here from email for work this route fine
//                     password: "test0000",
//                     passwordVerify: "test0000",
//                 })
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Unsuccessful Operation with invalid OTP : RESET PWD', (done) => {
//             request(baseUrl)
//                 .post(`/auth/resetPassword`)
//                 .send({
//                     otp: "T1VJBX",
//                     email: user[0].email,
//                     // otp from custome user created at top  -> valid otp from email for one time 
//                     // need to paste the otp here from email for work this route fine
//                     password: "test0000",
//                     passwordVerify: "test0000",
//                 })
//                 .expect(404)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//     })
//     describe('GET REQUEST', () => {
//         /**
//     * @note uncomment to run this route for testing purpose only  
//     * @note grab the token from activ logged in user 
//     * @note change the token with different user logged in at the time 
//     */
//         // it('should get user logout', (done) => {
//         //     request(baseUrl)
//         //         .get(`/auth/logout`)
//         //         .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjI0MTU0MDM5ZDQxZjZhYTY3YzBjZDkzIiwianRpIjoibkN1SWR5eFg5RCIsImlhdCI6MTY1Njk5NzY5MCwiZXhwIjoxNjU4MjkzNjkwfQ.4M5ShL91yMX7i6Qg6AwOB5WbcRDo00lPNbxHW9lSnxs`)
//         //         .expect('Content-Type', /json/)
//         //         .expect(200)
//         //         .end(function (err, res) {
//         //             if (err) return done(err);
//         //             return done();
//         //         });

//         // })
//         it('Unsuccessful operation with no token : LOGOUT', (done) => {
//             request(baseUrl)
//                 .get(`/auth/logout`)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });

//         })

//         it('Unsuccessful operation with no token : GET ALL USERS', (done) => {
//             request(baseUrl)
//                 .get(`/users`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 .expect('Content-Type', /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Successful operation : GET ALL USERS', (done) => {
//             request(baseUrl)
//                 .get(`/users`)
//                 .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 .expect('Content-Type', /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })
//     })




//     describe('PUT REQUEST', () => {
//         /**
// * @note uncomment to run this route for testing purpose only  
// * @note grab the token from activ logged in user 
// * @note change the token with different user logged in at the time 
// */

//         it('Unsuccessful operation with no token : UPDATE USER', (done) => {
//             request(baseUrl)
//                 .put(`/users/update`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 // ${user[0].tokens[0].token} = custome created token
//                 .send({ name: "John Doe" })
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });

//         })

//         it('Successful operation : UPDATE USER', (done) => {
//             request(baseUrl)
//                 .put(`/users/update`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 // ${user[0].tokens[0].token} = custome created token
//                 .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//                 .send({ name: "John Doe" })
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });

//         })

//         it('Required fields missing : CHANGE PWD', (done) => {
//             request(baseUrl)
//                 .put(`/users/changepassword`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//                 .send({ currentPassword: "", newPassword: "" })
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Unsuccessful operation with no token : CHANGE PWD', (done) => {
//             request(baseUrl)
//                 .put(`/users/changepassword`)
//                 // grab the token from activ logged in user
//                 //  change the token with different user logged in at the time
//                 .send({ currentPassword: user[0].password, newPassword: user[0].passwordVerify })
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Passwords not matching : CHANGE PWD', (done) => {
//             request(baseUrl)
//                 .put(`/users/changepassword`)
//                 .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//                 .send({ currentPassword: user[0].password, newPassword: user[0].passwordVerify })
//                 .expect('Content-Type', /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })

//         it('Successful operation : CHANGE PWD', (done) => {
//             request(baseUrl)
//                 .put(`/users/changepassword`)
//                 .set('Authorization', `Bearer ${user[0].tokens[0].token}`)
//                 .send({ currentPassword: "test0000", newPassword: "test0000" })
//                 .expect('Content-Type', /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         })
//     })
// })

