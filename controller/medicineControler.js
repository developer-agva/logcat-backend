const medesionData = require('../model/IndianMedesionModel');
const redis = require('redis');
const client = redis.createClient();

// Promisify Redis get/set for async/await usage
const { promisify } = require('util');
const MedicineModel = require('../model/IndianMedesionModel');
const medicineModel = require('../model/IndianMedesionModel');
const icd10DiagnosisModel = require('../model/icd10DiagnosisModel');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.setex).bind(client);



const getAllMedicineData = async (req, res) => {
  try {
    // Search
    const search = req.query.search && req.query.search !== "undefined" ? req.query.search : "";
    if (search == "" || search == undefined || search == null) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Enter search value."
      })
    }
    const page = 1;
    const limit = 10;

    const medicineData = await medicineModel.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: `^${search}`, $options: "i" } },
            { short_composition1: { $regex: `^${search}`, $options: "i" } },
          ],
        },
      },
      { $project: { name: 1, short_composition1: 1, _id: 0 } },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page: page } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    if (!medicineData[0].data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
      });
    }

    const totalDataCount = medicineData[0].metadata[0].total;
    const totalPages = Math.ceil(totalDataCount / limit);
    const paginatedData = medicineData[0].data;

    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Medicine data retrieved successfully!",
      data: paginatedData,
      totalDataCount,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      status: -1,
      data: { data: null },
      err: {
        generatedTime: new Date(),
        errMsg: err.stack,
        msg: err.message,
        type: err.name,
      },
    });
  }
};


const getIcd10DiagnosisData = async (req, res) => {
  try {
    // Search
    const search = req.query.search && req.query.search !== "undefined" ? req.query.search : "";
    if (search == "" || search == undefined || search == null) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Enter search value."
      })
    }
    const page = 1;
    const limit = 10;

    const icd10Data = await icd10DiagnosisModel.aggregate([
      {
        $match: {
          $or: [
            { code: { $regex: `^${search}`, $options: "i" } },
            { desc: { $regex: `^${search}`, $options: "i" } },
          ],
        },
      },
      { $project: { code: 1, desc: 1, _id: 0 } },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page: page } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
        }
      }
    ]);

    if (!icd10Data[0].data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
      });
    }
    const totalDataCount = icd10Data[0].metadata[0].total;
    const totalPages = Math.ceil(totalDataCount / limit);
    const paginatedData = icd10Data[0].data;

    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Illness data retrieved successfully!",
      data: paginatedData,
      totalDataCount,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      status: -1,
      data: { data: null },
      err: {
        generatedTime: new Date(),
        errMsg: err.stack,
        msg: err.message,
        type: err.name,
      },
    });
  }
};


module.exports = {
    getAllMedicineData,
    getIcd10DiagnosisData
};
 