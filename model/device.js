const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    did: {
      type: String,
      required: [true, "Device id is required."],
      // validate: {
      //   validator: function (v) {
      //     return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/.test(
      //       v
      //     );
      //   },
        // message: "{VALUE} is not a valid device id.",
      // },
    },
    name: {
      type: String,
      required: [true, "Device name is required."],
    },
    manufacturer: {
      type: String,
    },
    os: {
      name: {
        type: String,
        required: [true, "OS name is required."],
      },
      type: {
        type: String,
        enum: ["linux", "windows", "iOS", "other"],
        required: [true, "OS type is required."],
      },
    },
    battery: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    
  },
  { timestamps: true }
);

const device = mongoose.model("Device", deviceSchema);

module.exports = device;
