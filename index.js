const cron = require('node-cron');
const express = require("express");
const { json } = require('express');
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
const { deviceIdArr } = require('./middleware/msgResponse');
// sendin blue
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
// const https = require('https')

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

// end sendin blue
// graphQL
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql');


// importing router
const users = require("./route/users.js");
const projects = require("./route/projects");
const logs = require("./route/logs");

// medicine route data
const medicine = require("./route/medesionRout.js")


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
const salesRouter = require('./route/salesRoute.js');
const insulRouter = require('./route/insulRoute.js')
const dynamicRouter = require('./route/dynamicUIRoute.js');

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

// for graphQL middleware
app.use("/graphql", 
  graphqlHTTP({
    schema,
    graphiql: true, // Enable GraphiQL GUI for testing
  })
)

// adding static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "1mb", extended: true }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Users Routing
app.use("/api/logger", users);

// Project Routing
app.use("/api/logger/projects", projects);
app.use("/allMedicine", medicine);
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
app.use("/api/marketing", salesRouter);
app.use('/insul', insulRouter);
app.use("/api/dynamic-ui", dynamicRouter);


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

const PORT = process.env.PORT || 8000;

// Socket start
const { Server } = require("socket.io");
const { messaging } = require("firebase-admin");

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // List of allowed origins
      const allowedOrigins = ["http://medtap.in", "https://medtap.in", "http://18.144.79.162:3000", "https://18.144.79.162:3000", "http://172.23.100.109:3000"];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT"],
  },
});


// Start socket.io code
// Socket.IO connection hand
io.on("connection", (socket) => {
  console.log("A user connected");
  // start android logic
  socket.on("AndroidStartUp", async (deviceIdAndroid) => {
    console.log("run android startup")
    if (deviceIdArr.includes(deviceIdAndroid)) {
    } else{
      deviceIdArr.push(deviceIdAndroid)
    }
    // try {
    //   await feedbackModel.findOneAndUpdate(
    //     {}, // use a filter here if needed
    //     { $set: { name: deviceIdAndroid } },
    //     { upsert: true, new: true }
    //   );
    //   console.log("Saved new deviceIdArr to DB:", deviceIdArr);
    // } catch (err) {
    //   console.error("Error saving deviceIdArr:", err);
    // }
  })

  // send payment status to android
  socket.on("DeviceRequestForPaymentStatus", async (deviceId) => {
    try {
      console.log(11, deviceId)
      const deviceDetails = await RegisterDevice.findOne(
        { DeviceId: deviceId },
        { createdAt: 0, updatedAt: 0, __v: 0 }
      );
      
      if (!deviceDetails) {
        console.error(`Device with ID ${deviceId} not found.`);
        // socket.emit("AndroidReceivingPaymentStatus", `${deviceId}^Device not found`);
        return;
      }
      
      console.log("android payment status", `${deviceId}^${deviceDetails.isPaymentDone}^${deviceDetails.paymentDoneInPercent}`);
      socket.emit("AndroidReceivingPaymentStatus", `${deviceId}^${deviceDetails.isPaymentDone}^${deviceDetails.paymentDoneInPercent}`);
    } catch (error) {
      console.error("Error fetching device details:", error);
      // socket.emit("AndroidReceivingPaymentStatus", `${deviceId}^Error fetching payment status`);
    }
  });
  

  socket.on("ReactRequestForPaymentStatus", async (deviceId) => {
    try {
      console.log(11, deviceId)
      const deviceDetails = await RegisterDevice.findOne(
        { DeviceId: deviceId },
        { createdAt: 0, updatedAt: 0, __v: 0 }
      );
  
      if (!deviceDetails) {
        console.error(`Device with ID ${deviceId} not found.`);
        // socket.broadcast.emit("AndroidReceivingPaymentStatus", `${deviceId}^Device not found`);
        return;
      }
      
      console.log("react payment status", `${deviceId}^${deviceDetails.isPaymentDone}^${deviceDetails.paymentDoneInPercent}`);
      socket.broadcast.emit("AndroidReceivingPaymentStatus", `${deviceId}^${deviceDetails.isPaymentDone}^${deviceDetails.paymentDoneInPercent}`);
    } catch (error) {
      console.error("Error fetching device details:", error);
      // socket.broadcast.emit("AndroidReceivingPaymentStatus", `${deviceId}^Error fetching payment status`);
    }
  });
  
  
  // save locked status in db
  socket.on("NodeReceivingLockedStatus", async (data) =>{
    try {
      console.log("locked status",data);
      const dataArr = data?.split(",") || [];
      // if (dataArr.length < 1) {
      //   console.error("Invalid data format. Expected at least one element.");
      //   return;
      // }
      
      const deviceId = dataArr[0];
      const isPaymentDone = dataArr.length > 1 ? dataArr[1] : true;
      const isLocked = dataArr.length > 2 ? dataArr[2] : false;
      const lockedStatus = dataArr.length > 3 ? dataArr[3] : "";

      // Update the database entry for the device
      const updatedDevice = await RegisterDevice.findOneAndUpdate(
        { DeviceId: deviceId },
        { isPaymentDone, isLocked, lockedStatus },
        { upsert: true, new: true }
      );
      // console.log("Device updated successfully:", "updatedDevice");

    } catch (error) {
      console.error("Error processing NodeReceivingLockedStatus event:", error);
    }
  })
   
  // start react logic`
  socket.on("ReactStartUp", (deviceIdReact) => {
    console.log("run react startup")
    if (deviceIdArr.includes(deviceIdReact)) {
      console.log("finded device id")
      socket.broadcast.emit("AndroidNodeStart", `${deviceIdReact},Start`);
    } else {
      console.log("not found device id")
      socket.broadcast.emit("ReceiverVentilatorDisconnected", `${deviceIdReact},Disconnect`);
    }
  })
  // start react logic`
  socket.on("ReactStartUpGraph", (deviceIdReact) => {
    console.log("run react startup graph")
    if (deviceIdArr.includes(deviceIdReact)) {
      console.log("finded device id graph")
      socket.broadcast.emit("AndroidNodeStartGraph", `${deviceIdReact},Start`);
    }
  })
  // get data of basic tiles
  socket.on("AndroidToNodeBasic", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToReactBasic", data);
  })
  // get data of backup tiles
  socket.on("AndroidToNodeBackup", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToReactBackup", data);
  })
  // get data of advanced tiles
  socket.on("AndroidToNodeAdvanced", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToReactAdvanced", data);
  })
  // get data of alarms tiles
  socket.on("AndroidToNodeAlarm", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToReactAlarm", data);
  })
  // get data of backup tiles command
  socket.on("ReactToNodeBackup", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToAndroidBackup", data);
  })
  // get data of basic tiles command
  socket.on("ReactToNodeBasic", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToAndroidBasic", data);
  })
  // get data of advanced tiles command
  socket.on("ReactToNodeAdvanced", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToAndroidAdvanced", data);
  })
  // get data of alarms tiles command
  socket.on("ReactToNodeAlarm", (data) => {
    console.log(data)
    socket.broadcast.emit("NodeToAndroidAlarm", data);
  })
  // logic of data sending and receiving
  socket.on("DataSendingAndroid", (data) => {
    console.log(data)
    socket.broadcast.emit("DataReceivingReact", data);
  })
  // logic of graph data sending and receiving
  socket.on("DataGraphSendingAndroid", (data) => {
    console.log(data)
    socket.broadcast.emit("DataGraphReceivingReact", data);
  })
  // stop logic
  socket.on("ReactNodeStop", (data) => {
    console.log("run react stop android", data)
    socket.broadcast.emit("AndroidReceiveStop", data);
  })
  // stop graph data logic
  socket.on("ReactNodeStopGraph", (data) => {
    console.log("run react stop android graph", data)
    socket.broadcast.emit("AndroidReceiveStopGraph", data);
  })
  // android stop auto
  socket.on("AndroidStopAuto", (data) => {
    console.log("run auto stop android", data)
    socket.broadcast.emit("ReceiverVentilatorDisconnected", `${data},Disconnect`);
  })
  // disconnect android
  socket.on("AndroidDisconnect", (data) => {
    deviceIdArr.pop(data)
  })
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  // logic for sending diagnostic data

  socket.on("DataSendingAndroidDiagnostic", (data) => {
    // console.log(data)
    socket.broadcast.emit("DataReceivingReactDiagnostic", data);
  })

  // when android send reverts 
  socket.on("AndroidSendingCommand", (data) => {
    console.log("AndroidCommand", data)
    socket.broadcast.emit("ReactReceiveCommand", data);
  });

  // when react send commands
  socket.on("ReactSendingCommand", (data) => {
    console.log("ReactCommand", data)
    socket.broadcast.emit("AndroidReceiveCommand", data);
  })

  socket.on("ReactSendingRange", (data) => {
    console.log("ReactRange", data)
    socket.broadcast.emit("AndroidReceivingRange", data);
  })

  socket.on("AndroidSendingRange", (data) => {
    console.log("AndroidRange", data)
    socket.broadcast.emit("ReactReceivingRange", data);
  })

  // debug case
  socket.on("AndroidSendingDebugCommand", (data) => {
    console.log("AndroidDebug", data)
    socket.broadcast.emit("ReactReceivingDebugCommand", data);
  })

  socket.on("ReactSendingDebugCommand", (data) => {
    console.log("ReactDebug", data)
    socket.broadcast.emit("AndroidReceivingDebugCommand", data);
  })

  socket.on("DataSendingAndroidDebug", (data) => {
    // console.log(data)
    socket.broadcast.emit("DataReceivingReactDebug", data);
  })
});
// Socket end

// Start cron-job
const trends_ventilator_collection = require("./model/trends_ventilator_collection.js");
const trends_ventilator_collection_backup = require("./model/trends_ventilator_collection_backup.js");

const alert_ventilator_collection = require('./model/alert_ventilator_collection.js')
const alert_ventilator_collection_backup = require('./model/alert_ventilator_collection_backup.js');
const productionModel = require("./model/productionModel.js")
const todayActiveDeviceCountModel = require('./model/todayActiveDeviceCountModel.js');
const statusModel = require('./model/statusModel.js');
const sendDeviceInactiveEmail = require('./helper/sendDeviceInactiveEmail.js');
const aboutDeviceModel = require('./model/aboutDeviceModel.js');
const { boolean } = require('joi');

async function shiftAlarmData() {
  try {
    // Check document count in source collection
    const count = await alert_ventilator_collection.countDocuments();

    if (count > 50000) {
      const excessDocuments = count - 50000;

      // Fetch excess documents (oldest first)
      const excessData = await alert_ventilator_collection.find({}).sort({ _id: 1 }).limit(excessDocuments);

      // Insert excess data into the backup collection
      if (excessData.length > 0) {
        await alert_ventilator_collection_backup.insertMany(excessData);

        // Remove the excess data from the source collection
        const excessIds = excessData.map(doc => doc._id);
        await alert_ventilator_collection.deleteMany({ _id: { $in: excessIds } });
        console.log(`Shifted ${excessDocuments} documents to backup collection.`);
      }
    } else {
      console.log('No excess data to shift.');
    }

  } catch (error) {
    console.error('Error in shifting alarm data:', error);
  }
}

// Schedule the cron job to run once a day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running cron job...');
  shiftAlarmData();
});


const mongoose = require("mongoose");
const feedbackModel = require('./model/feedbackModel.js');
const RegisterDevice = require('./model/RegisterDevice.js');
async function moveOldTrendsData() {
    const db = mongoose.connection.db;

    try {
        // Step 1: Find the _id of the 100,000th most recent document
        const thresholdDoc = await db.collection("trends_ventilator_collections")
            .find({})
            .sort({ _id: -1 })  // Sort in descending order (most recent first)
            .skip(100000)        // Skip the latest 100,000 documents
            .limit(1)
            .toArray();

        if (thresholdDoc.length === 0) {
            console.log("No data to move.");
            return;
        }

        const thresholdId = thresholdDoc[0]._id; // Get the _id of the 100,000th most recent document

        // Step 2: Move all older documents to backup collection
        const bulkOps = await db.collection("trends_ventilator_collections")
            .find({ _id: { $lt: thresholdId } })
            .toArray();

        if (bulkOps.length > 0) {
            // Insert the documents into backup collection
            await db.collection("trends_ventilator_collection_backups").insertMany(bulkOps);

            // Step 3: Remove the moved documents from the original collection
            await db.collection("trends_ventilator_collections").deleteMany({ _id: { $lt: thresholdId } });

            console.log(`${bulkOps.length} documents moved to trends_ventilator_collection_backups and deleted from trends_ventilator_collections.`);
        } else {
            console.log("No old records found to move.");
        }

    } catch (error) {
        console.error("Error while moving data:", error);
    }
}

// Call the function after DB connection is established
// moveOldTrendsData();

cron.schedule('0 0 * * *', () => {
    console.log("Running trends data migration job...");
    moveOldTrendsData();
});




// shiftTrendsData();

// Schedule the cron job to run once a day at midnight
cron.schedule('0 2 * * *', () => {
  console.log('Running cron job...');
  shiftTrendsData();
});


async function todayActiveDevicesCount() {
  try {

    const initialDate = new Date("2023-12-01T00:00:00Z");
    let endDate2 = new Date();
    endDate2.setDate(endDate2.getDate() - 1);

    const moment = require('moment-timezone');
    const currentDate = moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
    const currentDateInKolkata = moment.tz("Asia/Kolkata");
    const hoursArray = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    // console.log(11, productionData.length)  

    const pipelines = hoursArray.map(hours => {
      return {
        $facet: {
          [`eventsForLast${hours}Hr`]: [
            { $match: { createdAt: { $gte: moment(currentDateInKolkata).subtract(hours, 'hours').toDate(), $lte: currentDateInKolkata.toDate() } } },
            { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$latestEvent" } }
          ]
        }
      };
    });
    const results = await Promise.all(pipelines.map(pipeline => productionModel.aggregate([pipeline])));

    const todayActiveDeviceCount = results.map((result, index) => {
      const count = result[0][`eventsForLast${hoursArray[index]}Hr`].length;
      const duration = moment(currentDateInKolkata).subtract(hoursArray[index], 'hours').format('YYYY-MM-DD h:mm A');
      return { duration, count };
    }).sort((a, b) => new Date(a.duration) - new Date(b.duration));


    const productionData = await productionModel.find({
      $and: [
        { deviceId: { $ne: "" } }, { productType: { $ne: "Suction" } },
        { createdAt: { $gte: initialDate, $lte: endDate2 } }
      ]
    },
      { _id: 1, deviceId: 1, createdAt: 1, updatedAt: 1, deviceType: 1, purpose: 1 }
    )

    const initialCount = productionData.length + 2
    // console.log(11,productionData.length)

    let updatedRsult = todayActiveDeviceCount.map(item => {
      // Extract time part after the space character
      const time = item.duration.split(' ')[1] + ' ' + item.duration.split(' ')[2];
      const count = (item.count) + (initialCount)
      return { count: count, duration: time };
    })


    // Calculate maxCount value
    let maxCount = -Infinity;
    for (item of todayActiveDeviceCount) {
      if (item.count > maxCount) {
        maxCount = item.count
      }
    }

    // Format response
    updatedRsult = updatedRsult.map(item => {
      let duration = item.duration.replace(/:\d{2}/, '')
      return { ...item, duration }
    })
    if (updatedRsult.length > 0) {
      // Create a new entry in the model
      const getData = await todayActiveDeviceCountModel.find({}).sort({ _id: -1 }).limit(1)
      const newEntry = await todayActiveDeviceCountModel.findByIdAndUpdate({ _id: getData[0]._id }, {
        todayActiveDevices: updatedRsult
      });
    }
  } catch (error) {
    console.log('Error in calculating the today active devices count hourly basis', error);
  }
}

// Schedule the cron job to run for today active devices count
cron.schedule('0 5,9,13 * * *', () => {
  console.log('Running cron job for today active devices count hour hourly basis');
  todayActiveDevicesCount();
});


async function todayActiveDemoDeviceCount() {
  try {
    const initialDate = new Date("2023-11-01T00:00:00Z");
    let endDate2 = new Date();
    endDate2.setDate(endDate2.getDate() - 1);

    const moment = require('moment-timezone');
    const currentDate = moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
    const currentDateInKolkata = moment.tz("Asia/Kolkata");
    const hoursArray = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    // console.log(11, productionData.length)  

    const pipelines = hoursArray.map(hours => {
      return {
        $facet: {
          [`eventsForLast${hours}Hr`]: [
            { $match: { createdAt: { $gte: moment(currentDateInKolkata).subtract(hours, 'hours').toDate(), $lte: currentDateInKolkata.toDate() } } },
            { $group: { _id: "$deviceId", latestEvent: { $last: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$latestEvent" } }
          ]
        }
      };
    });
    const results = await Promise.all(pipelines.map(pipeline => productionModel.aggregate([pipeline])));

    const todayActiveDeviceCount = results.map((result, index) => {
      const count = result[0][`eventsForLast${hoursArray[index]}Hr`].length;
      const duration = moment(currentDateInKolkata).subtract(hoursArray[index], 'hours').format('YYYY-MM-DD h:mm A');
      return { duration, count };
    }).sort((a, b) => new Date(a.duration) - new Date(b.duration));


    const productionData = await productionModel.find({
      $and: [
        { deviceId: { $ne: "" } }, { productType: { $ne: "Suction" } },
        { purpose: "Demo" },
        { createdAt: { $gte: initialDate, $lte: endDate2 } }
      ]
    },
      { _id: 1, deviceId: 1, createdAt: 1, updatedAt: 1, deviceType: 1, purpose: 1 }
    )

    const initialCount = productionData.length
    // console.log(11,productionData.length)

    let updatedRsult = todayActiveDeviceCount.map(item => {
      // Extract time part after the space character
      const time = item.duration.split(' ')[1] + ' ' + item.duration.split(' ')[2];
      const count = (item.count) + (initialCount)
      return { count: count, duration: time };
    })

    // Calculate maxCount value
    let maxCount = -Infinity;
    for (item of updatedRsult) {
      if (item.count > maxCount) {
        maxCount = item.count
      }
    }

    // Format response
    updatedRsult = updatedRsult.map(item => {
      let duration = item.duration.replace(/:\d{2}/, '')
      return { ...item, duration }
    })
    if (updatedRsult.length > 0) {
      // Create a new entry in the model
      const getData = await todayActiveDeviceCountModel.find({}).sort({ _id: -1 }).limit(1)
      const newEntry = await todayActiveDeviceCountModel.findByIdAndUpdate({ _id: getData[0]._id }, {
        todayActiveDemoDevices: updatedRsult
      }, { upsert: true });
    }
  } catch (error) {
    console.log('Error in calculating the today active devices count hourly basis', error);
  }
}

// Schedule the cron job to run for today active devices count
cron.schedule('0 4,10,14 * * *', () => {
  console.log('Running cron job for today active devices demo count hour hourly basis');
  todayActiveDemoDeviceCount();
});



async function todayActiveDeviceCountAgvaPro() {
  try {
    const moment = require('moment-timezone');
    const currentDate = moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
    const currentDateInKolkata = moment.tz("Asia/Kolkata");
    const hoursArray = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    const pipelines = hoursArray.map(hours => {
      return {
        $facet: {
          [`eventsForLast${hours}Hr`]: [
            { $match: { updatedAt: { $gte: moment(currentDateInKolkata).subtract(hours, 'hours').toDate(), $lte: currentDateInKolkata.toDate() } } },
            { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$latestEvent" } }
          ]
        }
      };
    });
    // const results = await Promise.all(pipelines.map(pipeline => event_ventilator_collection.aggregate([pipeline])));
    const results = await Promise.all(pipelines.map(pipeline => trends_ventilator_collection.aggregate([pipeline])));

    const todayActiveDeviceCount = results.map((result, index) => {
      const count = result[0][`eventsForLast${hoursArray[index]}Hr`].length;
      const duration = moment(currentDateInKolkata).subtract(hoursArray[index], 'hours').format('YYYY-MM-DD h:mm A');
      return { duration, count };
    }).sort((a, b) => new Date(a.duration) - new Date(b.duration));

    let updatedRsult = todayActiveDeviceCount.map(item => {
      // Extract time part after the space character
      const time = item.duration.split(' ')[1] + ' ' + item.duration.split(' ')[2];
      return { ...item, duration: time };
    })

    // Calculate maxCount value
    let maxCount = -Infinity;
    for (item of todayActiveDeviceCount) {
      if (item.count > maxCount) {
        maxCount = item.count
      }
    }

    // For formating data response
    updatedRsult = updatedRsult.map(item => {
      let duration = item.duration.replace(/:\d{2}/, ''); // Remove the minutes part
      return { ...item, duration };
    });

    if (updatedRsult.length > 0) {
      // Create a new entry in the model
      const getData = await todayActiveDeviceCountModel.find({}).sort({ _id: -1 }).limit(1)
      const newEntry = await todayActiveDeviceCountModel.findByIdAndUpdate({ _id: getData[0]._id }, {
        todayActiveDeviceAgvaPro: updatedRsult
      }, { upsert: true });
    }
  } catch (error) {
    console.log('Error in calculating the today active devices count agva pro hourly basis', error);
  }
}

// Schedule the cron job to run for today active devices count
cron.schedule('0 6,19 * * *', () => {
  console.log('Running cron job for today active devices count hour hourly basis');
  todayActiveDeviceCountAgvaPro();
});

async function todayActiveDeviceDemoCountAgvaPro() {
  try {
    const moment = require('moment-timezone');
    const prodData = await productionModel.find({ $and: [{ purpose: "Demo" }, { productType: { $ne: "Suction" } }] }, { _id: 1, purpose: 1, deviceId: 1 })
    const deviceIds = prodData.map((item) => {
      return item.deviceId
    })

    const currentDateInKolkata = moment.tz("Asia/Kolkata");
    // console.log(34,currentDateInKolkata)
    const hoursArray = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    const pipelines = hoursArray.map(hours => {
      return {
        $facet: {
          [`eventsForLast${hours}Hr`]: [
            {
              $match: {
                updatedAt: {
                  $gte: moment(currentDateInKolkata).subtract(hours, 'hours').toDate(),
                  $lte: currentDateInKolkata.toDate()
                },
                did: { $in: deviceIds } // Add this line to filter by deviceIds
              }
            },
            {
              $group: {
                _id: "$did",
                latestEvent: { $last: "$$ROOT" }
              }
            },
            {
              $replaceRoot: { newRoot: "$latestEvent" }
            }
          ]
        }
      };
    });

    const results = await Promise.all(
      // pipelines.map(pipeline => event_ventilator_collection.aggregate([pipeline]))
      pipelines.map(pipeline => trends_ventilator_collection.aggregate([pipeline]))
    );

    const todayActiveDeviceCount = results.map((result, index) => {
      const count = result[0][`eventsForLast${hoursArray[index]}Hr`].length;
      const duration = moment(currentDateInKolkata).subtract(hoursArray[index], 'hours').format('YYYY-MM-DD h:mm A');
      return { duration, count };
    }).sort((a, b) => new Date(a.duration) - new Date(b.duration));

    let updatedResult = todayActiveDeviceCount.map(item => {
      // Extract time part after the space character
      const time = item.duration.split(' ')[1] + ' ' + item.duration.split(' ')[2];
      return { ...item, duration: time };
    });

    // Calculate maxCount value
    let maxCount = -Infinity;
    for (item of todayActiveDeviceCount) {
      if (item.count > maxCount) {
        maxCount = item.count
      }
    }

    // Formating data response
    updatedResult = updatedResult.map(item => {
      let duration = item.duration.replace(/:\d{2}/, ''); // Remove the minutes part
      return { ...item, duration };
    });
    // console.log('check', updatedResult)
    if (updatedResult.length > 0) {
      // Create a new entry in the model
      const getData = await todayActiveDeviceCountModel.find({}).sort({ _id: -1 }).limit(1)
      const newEntry = await todayActiveDeviceCountModel.findByIdAndUpdate({ _id: getData[0]._id }, {
        todayActiveDemoDeviceAgvaPro: updatedResult
      }, { upsert: true });
    }

  } catch (error) {
    console.log('Error in calculating the today active demo devices count agva pro hourly basis', error);
  }
}

cron.schedule('0 7,17,22 * * *', () => {
  console.log('Running cron job for today active demo devices count hour hourly basis');
  todayActiveDeviceDemoCountAgvaPro();
});
// todayActiveDeviceDemoCountAgvaPro();

async function sendEmailForLastInactiveDevice() {
  try {
    const statusData = await statusModel.find({$and:[{message: "INACTIVE"},{lastActive:{$ne:"--"}}]},{deviceId:1, message:1, lastActive:1, total_hours:1, _id:0});
    // console.log(11, inactiveDevices)
    const now = new Date();
    const inactiveDevices = statusData.filter((device) => {
      const lastActiveDate = new Date(device.lastActive);
      const hoursDiff = (now - lastActiveDate) / (1000 * 60 * 60);
      return hoursDiff > 24;
    })
    // console.log(inactiveDevices)
    
    
    
    const demoDevices = await aboutDeviceModel
      .find({ purpose: "Demo" }, { deviceId: 1, hospital_name: 1, serial_no: 1 })
      .lean();

    // const inactiveDevices = await someInactiveDeviceModel.find({ /* your query */ });

    const plainInactiveDevices = inactiveDevices.map((device) => device.toObject()); // Convert to plain objects.

    const commonDevices = plainInactiveDevices.filter((inactiveDevice) =>
      demoDevices.some((demoDevice) => demoDevice.deviceId === inactiveDevice.deviceId)
    );
    
    const mergedData = commonDevices.map((device) => {
      const matchingDevice = demoDevices.find((demo) => demo.deviceId === device.deviceId);
      // console.log(11, matchingDevice)

      if (matchingDevice) {
        const { hospital_name, serial_no } = matchingDevice;
        return {
          ...device,
          hospital_name,
          serial_no,
        };
      }

      return null;
    }).filter(Boolean);
    // console.log(11, mergedData)
    const tableContent = mergedData?.map((item,index) => {
      return(
        `<tr key =${index}>
          <td>${item.serial_no}</td>
          <td>${item.deviceId}</td>
          <td>${item.hospital_name}</td>
          <td>${item.total_hours}</td>
          <td>${item.message}</td>
      </tr>`)
    }).join(" ")
    await sendDeviceInactiveEmail("support@agvahealthtech.com", tableContent) // support@agvahealthtech.com
    // console.log(tableContent)

  } catch (error) {
    console.log('Error in calculating the today active demo devices count agva pro hourly basis', error);
  }
}
// sendEmailForLastInactiveDevice()
// Schedule a cron job to run at 8:00 AM every day
cron.schedule('0 8 * * *', () => {
  console.log('Running cron job at 8:00 AM...');
  sendEmailForLastInactiveDevice();
});

// End cron-job


// Start code for 
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