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
      const allowedOrigins = ["http://medtap.in", "https://medtap.in", "http://18.144.79.162:3000", "https://18.144.79.162:3000"];

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
  socket.on("AndroidStartUp", (deviceIdAndroid) => {
    console.log("run android startup")
    if (deviceIdArr.includes(deviceIdAndroid)) {
    } else {
      deviceIdArr.push(deviceIdAndroid)
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
});
// Socket end

// Start cron-job
const trends_ventilator_collection = require("./model/trends_ventilator_collection.js");
const trends_ventilator_collection_backup = require("./model/trends_ventilator_collection_backup.js");

const alert_ventilator_collection = require('./model/alert_ventilator_collection.js')
const alert_ventilator_collection_backup = require('./model/alert_ventilator_collection_backup.js');
const productionModel = require("./model/productionModel.js")
const todayActiveDeviceCountModel = require('./model/todayActiveDeviceCountModel.js')

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

async function shiftTrendsData() {
  try {
    // Check document count in source collection
    const count = await trends_ventilator_collection.countDocuments();
    if (count > 50000) {
      const excessDocuments = count - 50000;

      // Fetch excess documents (oldest first)
      const excessData = await trends_ventilator_collection.find({}).sort({ _id: 1 }).limit(excessDocuments);

      // Insert excess data into the backup collection
      if (excessData.length > 0) {
        await trends_ventilator_collection_backup.insertMany(excessData);

        // Remove the excess data from the source collection
        const excessIds = excessData.map(doc => doc._id);
        await trends_ventilator_collection.deleteMany({ _id: { $in: excessIds } });
        console.log(`Shifted ${excessDocuments} documents to backup collection.`);
      } else {
        console.log('No excess data to shift.');
      }
    }
  } catch (error) {
    console.error('Error in shifting trends data:', error);
  }
}

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
cron.schedule('0 6,12,19 * * *', () => {
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
}); 0
// todayActiveDeviceDemoCountAgvaPro();
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