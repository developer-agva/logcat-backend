const mongoose = require('mongoose');

const ventilatorConfSchema = new mongoose.Schema({
  Product_ID: {
    type: String,
    required: true,
    unique: true
  },
  Product_Name: {
    type: String,
    required: true
  },
  sensors: {
    Pressure_Sensor: { type: String, required: true },
    Flow_Sensor: { type: String, required: true },
    Oxygen_Sensor: { type: String, required: true },
    Proportional_Valve: { type: String, required: true },   
    NeoNate_Sensor: { type: String, required: true },
    Nebuliser_TYPE: { type: String, required: true },
    SpO2_Sensor: { type: String, required: true },
    KNOB_PCB_TYPE: { type: String, required: true }
  }
});

const ventilatorConfModel = mongoose.model('ventilator_configuration', ventilatorConfSchema);

module.exports = ventilatorConfModel;
