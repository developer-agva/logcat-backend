const mongoose = require("mongoose");

const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: false,
  },
  toObject: {
    virtuals: false,
  },
};

const trends_ventilator_collectionSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      required: [true, "Device id is required."],
      // validate: {
      //     validator: function (v) {
      //     return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4})$/.test(
      //         v
      //     );
      //     },
      //     message: "{VALUE} is not a valid device id.",
      // },
    },
    time: {
      type: String,
      required: [true, "time is required"],
    },
    type: {
      type: String,
      enum: ["001", "002", "004"],
      required: [true, "Atleast one model required."],
    },
    mode: {
      type: String,
      required: [true, "mode is required"],
    },
    pip: {
      type: String,
      required: [true, "PiP is required"],
    },
    peep: {
      type: String,
      required: [true, "Peep is required"],
    },
    mean_Airway: {
      type: String,
      required: [true, "mean_Airway is required"],
    },
    vti: {
      type: String,
      required: [true, "Vit is required"],
    },
    vte: {
      type: String,
      required: [true, "vte is required"],
    },
    mve: {
      type: String,
      required: [true, " Mve is required"],
    },
    mvi: {
      type: String,
      required: [true, "mvi is required"],
    },
    fio2: {
      type: String,
      required: [true, "fio2 is required"],
    },
    respiratory_Rate: {
      type: String,
      required: [true, "respiratory_Rate is required"],
    },
    ie: {
      type: String,
      required: [true, "ie is required"],
    },
    tinsp: {
      type: String,
      required: [true, " tinsp is required"],
    },
    texp: {
      type: String,
      required: [true, "texp is required"],
    },
    averageLeak: {
      type: String,
      required: [true, "averageLeak is required"],
    },
    sPo2: {
      type: String,
      required: [true, "sPo2 is required"],
    },
    pr: {
      type: String,
      required: [true, "pr is required"],
    },
  },
  schemaOptions
);

trends_ventilator_collectionSchema.index({ type: 1 });

const trends_ventilator_collection = mongoose.model(
  "trends_ventilator_collection",
  trends_ventilator_collectionSchema
);

module.exports = trends_ventilator_collection;
