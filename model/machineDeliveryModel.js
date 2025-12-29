const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productionDepartmentSchema = new Schema({
  serialNumber: { type: String },
  ipMacAddress: { type: String },
  androidMacAddress: { type: String },
  deviceId: { type: String },

  type: { type: String, enum: ["Demo", "Sale", "Replacement"] },
  model: { type: String },
  screenSize: { type: String },
  softwareVersion: { type: String },
  exhaleValveType: { type: String },
  neoSensorType: { type: String },
  description: { type: String },
  dhrFile: { type: String },
});

const accountDepartmentSchema = new Schema({
  billedTo: { type: String },
  shippedTo: { type: String },
  invoiceNumber: { type: String },
  amount: { type: String },
  deliveryNote: { type: String },
  deliveryBill: { type: String },
  ewayBill: { type: String },
});

const dispatchDepartmentSchema = new Schema({
  hospitalName: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
});

const serviceDepartmentSchema = new Schema({
  serviceEngineerName: { type: String },
  installationDate: { type: String },
  dispatchDate: { type: String },
  installationOrFeedbackReport: { type: String },
});

const machineDeliverySchema = new Schema({
  userId: {
    type: String,
    default: "",
  },

  productionDepartment: [productionDepartmentSchema],
  accountDepartment: [accountDepartmentSchema],
  dispatchDepartment: [dispatchDepartmentSchema],
  serviceDepartment: [serviceDepartmentSchema],

}, { timestamps: true });

const machineDeliveryModel = mongoose.model('machine_delivery', machineDeliverySchema);
module.exports = machineDeliveryModel;
