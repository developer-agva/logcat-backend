const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const icd10DiagnosSchema = new mongoose.Schema({
    
    code: { type: String, required: true },
    desc: { type: String, required: true },
}, 
{ 
    timestamps: true 
});

// Create compound index for fields commonly queried together
icd10DiagnosSchema.index({ code: 1, desc: 1 });

const icd10DiagnosisModel = mongoose.model('icd10diagnosi', icd10DiagnosSchema);

module.exports = icd10DiagnosisModel;
