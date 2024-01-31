var request = require("supertest");
var baseUrl = "http://localhost:8000/api/logger/projects";
var projectDetail = require("./server.test")
var activeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjI0MTU0MDM5ZDQxZjZhYTY3YzBjZDkzIiwianRpIjoiN3VwWHB6TXlaQyIsImlhdCI6MTY1ODIwNjU3OSwiZXhwIjoxNjU5NTAyNTc5fQ.WbA690Ases7xK2Y0MCpOeXHSz0uRYun2vqII6AmBKHU'

/**
* @note grab the token from activ logged in user 
* @note change the token with different user logged in at the time 
*/
// describe("PROJECT MODULE", () => {
//     describe("GET REQUEST", () => {
//         it("Unsuccessful operation with no token : GET ALL PROJECTS", (done) => {

//             request(`${baseUrl}`)
//                 .get(`/`)
//                 .expect("Content-Type", /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Successful operation : GET ALL PROJECTS", (done) => {

//             request(`${baseUrl}`)
//                 .get(`/`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .expect("Content-Type", /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Unsuccessful operation with no token : GET PROJECT DETAILS BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .get(`/getDeviceCount/${projectDetail[0].projectCode[1]}`)
//                 .expect("Content-Type", /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Required project code : GET PROJECT DETAILS BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .get(`/getDeviceCount/`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .expect("Content-Type", /json/)
//                 .expect(404)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Successful operation : GET PROJECT DETAILS BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .get(`/getDeviceCount/${projectDetail[0].projectCode[1]}`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken}`
//                 )
//                 .expect("Content-Type", /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Incorrect project code / Project not found : GET PROJECT BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .get(`/${projectDetail[0].projectCode[1]}A5`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .expect("Content-Type", /json/)
//                 .expect(404)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Successful operation : GET PROJECT BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .get(`/${projectDetail[0].projectCode[1]}`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .expect("Content-Type", /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//     });
//     describe("POST request", () => {
//         // run this route just for testing 
//         // second request it will not work coz it will create a entry in database 
//         // delete the database last entry to re run this testin route

//         it("Successful operation : CREATE NEW PROJECT", (done) => {
//             request(`${baseUrl}`)
//                 .post(`/`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .send({ name: projectDetail[0].newProjetDetails.name, description: projectDetail[0].newProjetDetails.description, device_type: projectDetail[0].newProjetDetails.device_type })
//                 .expect("Content-Type", /json/)
//                 .expect(201)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });


//         it("Unsuccessful operation with no token : CREATE NEW PROJECT", (done) => {
//             request(`${baseUrl}`)
//                 .post(`/`)
//                 .send({ name: projectDetail[0].newProjetDetails.name, description: projectDetail[0].newProjetDetails.description, device_type: projectDetail[0].newProjetDetails.device_type })
//                 .expect("Content-Type", /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Required fields missing : CREATE NEW PROJECT", (done) => {
//             request(`${baseUrl}`)
//                 .post(`/`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .send({ name: "", description: "", device_type: "" })
//                 .expect("Content-Type", /json/)
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });
//     });
//     describe("PUT request", () => {

//         it("Successful operation : UPDATE PROJECT BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .put(`/${projectDetail[0].projectCode[0]}`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .send({ name: projectDetail[0].newProjetDetails.name, device_type: ["type 3"] })
//                 .expect("Content-Type", /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Unsuccessful operation with no token : UPDATE PROJECT BY PROJECT CODE", (done) => {
//             request(`${baseUrl}`)
//                 .put(`/${projectDetail[0].projectCode[0]}`)
//                 .send({ name: projectDetail[0].newProjetDetails.name, device_type: ["type 3"] })
//                 .expect("Content-Type", /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Required fields missing : UPDATE CRASHLYTICS EMAIL", (done) => {
//             request(`${baseUrl}`)
//                 .put(`/updateEmail/${projectDetail[0].projectCode[0]}`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .send({ email: "" })
//                 .expect("Content-Type", /json/)
//                 .expect(400)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Unsuccessful operation with no token : UPDATE CRASHLYTICS EMAIL", (done) => {
//             request(`${baseUrl}`)
//                 .put(`/updateEmail/${projectDetail[0].projectCode[0]}`)
//                 .send({ email: projectDetail[0].email })
//                 .expect("Content-Type", /json/)
//                 .expect(401)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//         it("Successful operation : UPDATE CRASHLYTICS EMAIL", (done) => {
//             request(`${baseUrl}`)
//                 .put(`/updateEmail/${projectDetail[0].projectCode[0]}`)
//                 .set(
//                     "Authorization",
//                     `Bearer ${activeToken} `
//                 )
//                 .send({ email: projectDetail[0].email })
//                 .expect("Content-Type", /json/)
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     return done();
//                 });
//         });

//     });
// });
