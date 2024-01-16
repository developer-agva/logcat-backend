const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db.js");
const logger = require("./config/logger.js");
const morgan = require("morgan");
require("dotenv").config({ path: "./.env" });
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const http = require("http");
var cookieParser = require('cookie-parser');
const {deviceIdArr} = require('./middleware/msgResponse');

// sendin blue
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

// end sendin blue

// importing router
const users = require("./route/users.js");
const projects = require("./route/projects"); 
const logs = require("./route/logs");
// const RegisterDevice=require('./route/RegisterDevice');
const deviceRouter = require("./route/deviceRouter.js");
const patientRouter = require("./route/patientRoute.js");
const hospitalRouter = require("./route/hospitalRoute");
const projectRouter = require("./route/projectRouter.js");
const productionRouter = require("./route/productionRoute.js");
const supportRouter = require("./route/supportRoute.js");
var indexRouter = require('./route/index');
const commonRouter = require("./route/commonRoute.js");
const accountsRouter = require("./route/accountsRoute.js");
// var redis = require("redis")
// redisClient = redis.createClient();

// creating connection with DB
connectDB();

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.enable("trust proxy");
app.use(express.static(path.join(__dirname, 'public')));
// DEVELOPMENT environment morgan logs
// if (process.env.NODE_ENV === "DEVELOPMENT") {
app.use(morgan("tiny"));
// }

app.use(cors());

// For session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { expires: 60 * 60 * 1000 },
  })
);

// adding static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "1mb", extended: true }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Users Routing
app.use("/api/logger", users);

// Project Routing
app.use("/api/logger/projects", projects);
app.use("/registerDev", require("./route/RegisterDevice.js"));
app.use("/devices", deviceRouter);
app.use("/patient", patientRouter);
app.use("/hospital", hospitalRouter);
app.use("/projects", projectRouter);
app.use("/production", productionRouter);
app.use("/support/", supportRouter);
app.use('/api/s3', indexRouter);
app.use("/api/common", commonRouter);
app.use("/api/logger", accountsRouter);


// Logs Routing
app.use("/api/logger/logs", logs);

//RegisterDevice
// app.use('/api/logger/device',RegisterDevice);
// error handling for all routes which are not define
app.all("*", (req, res, next) => {
  res.status(400).json({
    status: 0,
    data: {
      err: {
        generatedTime: new Date(),
        errMsg: "No Route Found",
        msg: "No Route Found",
        type: "Express Error",
      },
    },
  });
  next();
});

const PORT = process.env.PORT || 5000;

// Socket start
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    // origin: "http://192.168.2.37:3000",
    origin: "http://3.26.129.121:3000",
    methods: ["GET", "POST"],
  },
});

// Global 
// var deviceIdArr = [];
// console.log(11,globalArray)
// Socket.IO connection hand
io.on('connection', (socket) => {
  console.log('A user connected');

  // start android logic
  socket.on('AndroidStartUp',(deviceIdAndroid)=>{
    console.log("run android startup")
    if(deviceIdArr.includes(deviceIdAndroid)) {
    }else{
      deviceIdArr.push(deviceIdAndroid)
    }
  })

  // start react logic`
  socket.on('ReactStartUp',(deviceIdReact)=>{
    console.log("run react startup")
     if(deviceIdArr.includes(deviceIdReact)){
       console.log("finded device id")
       socket.broadcast.emit('AndroidNodeStart',`${deviceIdReact},Start`);
     }else{
      console.log("not found device id")
      socket.broadcast.emit('ReceiverVentilatorDisconnected',`${deviceIdReact},Disconnect`);
     }
  })

  // logic of data sending and receiving
  socket.on('DataSendingAndroid',(data)=>{
    console.log(data)
    socket.broadcast.emit('DataReceivingReact',data);
  })

  // logic of graph data sending and receiving
  socket.on('DataGraphSendingAndroid',(data)=>{
    console.log(data)
    socket.broadcast.emit('DataGraphReceivingReact',data);
  })

  // stop logic
  socket.on('ReactNodeStop',(data)=>{
    console.log("run react stop android" , data)
    socket.broadcast.emit('AndroidReceiveStop',data);
  })
  // android stop auto
  socket.on('AndroidStopAuto',(data)=>{
    console.log("run auto stop android")
    socket.broadcast.emit('ReceiverVentilatorDisconnected',`${data},Disconnect`);
  })

  // disconnect android
  socket.on('AndroidDisconnect',(data) =>{
    deviceIdArr.pop(data)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Socket end

// send sms api

// const accountSid = 'ACc0e61f942e6af0e1f53875f469830ef9';
// const authToken = '515f24ec71a18ccd103dbe7e1c33c4f3';
// const twilioPhone = '+12057496028';
// const recipientPhone = '+917701971457';

// const twilio = require('twilio');
// const clientt = new twilio(accountSid, authToken);

// clientt.messages
//     .create({
//         body: 'Hello, this is a test message from Twilio!',
//         from: twilioPhone,
//         to: recipientPhone
//     })
//     .then(message => console.log(`Message sent with SID: ${message.sid}`))
//     .catch(error => console.error(`Error sending message: ${error.message}`));



// end sms

server.listen(PORT, () =>
  logger.error(`Server is running on port : ${PORT}`)
  
);
// module.exports = app.listen(PORT, () => console.log(`active on port ${PORT} `));

// unhandledRejection Error handling
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});
