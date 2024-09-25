const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  }
});

const todayActiveDevicesSchema = new mongoose.Schema({
  todayActiveDevices: {
    type: [deviceSchema],
    required: true
  },
  todayActiveDemoDevices:{
    type: [deviceSchema],
    required: true
  },
  todayActiveDeviceAgvaPro:{
    type: [deviceSchema],
    required: true
  },
  todayActiveDemoDeviceAgvaPro:{
    type: [deviceSchema],
    required: true
  }
});

const todayActiveDevicesCountModel = mongoose.model('TodayActiveDevices', todayActiveDevicesSchema);

module.exports = todayActiveDevicesCountModel;
