const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "Assistant", index: true },
    // _id: { type: String, index: true },
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    isDiscontinued: { type: Boolean, required: true }, // Changed to Boolean
    manufacturerName: { type: String, required: true },
    packSizeLabel: { type: String, required: true },
    shortComposition1: { type: String, required: true },
    shortComposition2: { type: String, required: true },
}, 
{ 
    timestamps: true 
});

// Create compound index for fields commonly queried together
MedicineSchema.index({ name: 1, price: 1 });

const medicineModel = mongoose.model('medicines', MedicineSchema);

module.exports = medicineModel;
