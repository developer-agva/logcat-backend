const expenseModel = require("../model/expenseModel");
const User = require("../model/users");
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
const Joi = require("joi");
const demoOrSalesModel = require("../model/demoOrSalesModel");
const mileStoneModel = require("../model/mileStoneModel");
const { ObjectId } = require("mongodb");
const moment = require('moment');

exports.addExpense = async (req, res) => {
  try {
    const schema = Joi.object({
      // userId: Joi.string().allow("").optional(),
      amount: Joi.string().required(),
      description: Joi.string().required(),
      time: Joi.string().allow("").optional(),
      isAvlBill: Joi.string().allow("").optional(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      });
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    const currentDate = new Date();
    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const year = currentDate.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day}-${month}-${year}`;

    const saveDoc = new expenseModel({
      userId: loggedInUser._id,
      amount: req.body.amount,
      description: req.body.description,
      time: req.body.time,
      date: formattedDate,
      isAvlBill: req.body.isAvlBill,
    });
    const savedData = await saveDoc.save();
    if (!!savedData) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully!",
        data: saveDoc,
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while adding data.",
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


exports.updateExpenseById = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const year = currentDate.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day}-${month}-${year}`;

    const checkData = await expenseModel.findById({ _id: req.params.id });
    if (!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong Id.",
      });
    }
    const updateDoc = await expenseModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        amount: !!req.body.amount ? req.body.amount : checkData.amount,
        description: !!req.body.description
          ? req.body.description
          : checkData.description,
        time: !!req.body.time ? req.body.time : checkData.time,
        date: formattedDate,
      },
      { upsert: true }
    );
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully!",
      data: updateDoc,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.deleteExpenseById = async (req, res) => {
  try {
    const checkData = await expenseModel.findById({ _id: req.params.id });
    if (!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong Id.",
      });
    }
    const deleteDoc = await expenseModel.findByIdAndDelete(
      { _id: req.params.id },
      { new: true }
    );
    if (!deleteDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not deleted.",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data deleted successfully!"
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


exports.getAllExpenses = async (req, res) => {
  try {
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || startDate === undefined || endDate === undefined) {
    const expenseData = await expenseModel
        .find(
          { userId: loggedInUser._id},
          { __v: 0, createdAt: 0, updatedAt: 0 }
        )
        .sort({ createdAt: -1 });
    if (expenseData.length>0) {
          return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully!",
            data: expenseData,
          });
        }
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not found."
        });
    } else {
      expenseData = await expenseModel
        .find(
          { userId: loggedInUser._id},
          { __v: 0, createdAt: 0, updatedAt: 0 }
        )
        .sort({ createdAt: -1 });

        // Function to convert the date string to a Date object
        function parseDate(dateString) {
          // Assuming the date format is "DD-MM-YYYY"
          const [day, month, year] = dateString.split("-");
          return new Date(`${year}-${month}-${day}`);
        }

        const start = parseDate(startDate);
        const end = parseDate(endDate);
      
        const filteredData = expenseData.filter(item => {
          const itemDate = parseDate(item.date);
          return itemDate >= start && itemDate <= end;
        });

        if (filteredData.length>0) {
          return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully!",
            data: filteredData,
          });
        }
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not found."
        });
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getAllDemo = async (req, res) => {
  try {
    let { page, limit } = req.query;
    // for search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }

    // for pagination
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }

    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    let demoData;
    if (loggedInUser.userType !== "Marketing-Admin") {
      demoData = await demoOrSalesModel.find(
        { $and: [{ userId: loggedInUser._id }, { status: { $ne: "Sold" } }] },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      );
      if (req.query.search) {
        demoData = await demoOrSalesModel.find(
          {
            $and: [
              { userId: loggedInUser._id },
              { status: { $ne: "Sold" } },
              {
                $or: [
                  {
                    hospitalName: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                  { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                ],
              },
            ],
          },
          { __v: 0, createdAt: 0, updatedAt: 0 }
        );
      }
      if (demoData.length < 1) {
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not found.",
          data: [],
        });
      }
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data get successfully!",
        data: demoData,
      });
    }
    demoData = await demoOrSalesModel.find(
      { status: { $ne: "Sold" } },
      { __v: 0, createdAt: 0, updatedAt: 0 }
    );
    if (req.query.search) {
      demoData = await demoOrSalesModel.find(
        {
          $and: [
            // {userId:loggedInUser._id},
            { status: { $ne: "Sold" } },
            {
              $or: [
                {
                  hospitalName: { $regex: ".*" + search + ".*", $options: "i" },
                },
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
              ],
            },
          ],
        },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      );
    }
    if (demoData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: [],
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully!",
      data: demoData,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getAllSalesData = async (req, res) => {
  try {
    let { page, limit } = req.query;
    // for search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }

    // for pagination
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(loggedInUser._id);
    // Get current date
    let soldData;
    if (loggedInUser.userType !== "Marketing-Admin") {
      soldData = await demoOrSalesModel.find(
        { $and: [{ userId: loggedInUser._id }, { status: "Sold" }] },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      );
      if (req.query.search) {
        soldData = await demoOrSalesModel.find(
          {
            $and: [
              { userId: loggedInUser._id },
              { status: "Sold" },
              {
                $or: [
                  {
                    hospitalName: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                  { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                ],
              },
            ],
          },
          { __v: 0, createdAt: 0, updatedAt: 0 }
        );
      }
      if (soldData.length < 1) {
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not found.",
          data: [],
        });
      }
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data get successfully!",
        data: soldData,
      });
    }
    soldData = await demoOrSalesModel.find(
      { status: "Sold" },
      { __v: 0, createdAt: 0, updatedAt: 0 }
    );
    if (req.query.search) {
      soldData = await demoOrSalesModel.find(
        {
          $and: [
            // {userId:loggedInUser._id},
            { status: "Sold" },
            {
              $or: [
                {
                  hospitalName: { $regex: ".*" + search + ".*", $options: "i" },
                },
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
              ],
            },
          ],
        },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      );
    }
    if (soldData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: [],
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully!",
      data: soldData,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getTotalDataCount = async (req, res) => {
  try {
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });


    // Get current date
    const getMilestoneData = await mileStoneModel.find({
      // createdBy: loggedInUser._id,
    });

    const getExpenseData = await expenseModel.find({});
    const totalDemo = getMilestoneData.reduce((sum, mileStone) => {
      return sum + parseFloat(mileStone.targetDemo);
    }, 0);
    // console.log(11, totalDemo)
    const totalSales = getMilestoneData.reduce((sum, mileStone) => {
      return sum + parseFloat(mileStone.targetSales);
    }, 0);
    // console.log(12, totalSales)
    const totalExpense = getExpenseData.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount);
    }, 0);
    // console.log(13, totalExpense)
    // total demo done and total sales done
    const totalDemoDone = await demoOrSalesModel.find({ status: "Closed" });
    const totalSalesDone = await demoOrSalesModel.find({ status: "Sold" });
    const finalObj = {
      totalDemo: totalDemo,
      totalDemoDone: !!totalDemoDone ? totalDemoDone.length : 0,
      totalSales: totalSales,
      totalSalesDone: !!totalSalesDone ? totalSalesDone.length : 0,
      totalExpense: totalExpense,
    };
    if (!!finalObj) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data get successfully!",
        data: [finalObj],
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Data not found.",
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getUserData1 = async (req, res) => {
  try {
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // user data
    let getData = await mileStoneModel.find(
      { createdBy: loggedInUser._id },
      { userId: 1 }
    );
    const userData = await User.find({
      userType: { $in: ["User", "Service-Engineer"] },
    });
    // Function to find matching user data
    function findMatchingUserData(getData, userData) {
      return getData
        .map((dataItem) => {
          const matchingUser = userData.find((user) =>
            user._id.equals(new ObjectId(dataItem.userId))
          );
          //   console.log(44, user._id)
          return {
            user: matchingUser,
          };
        })
        .filter((item) => item.user); // Filter out items where no user was found
    }

    const result = findMatchingUserData(getData, userData);
    const finalResult = result.map((item) => {
      return item.user;
      // console.log(item.user)
    });
    const uniqueColors = [...new Set(finalResult)];

    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Data not found.",
      data: uniqueColors,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


exports.getUserData = async (req, res) => {
  try {
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    
    // Target assigned userlist
    const targetUsers = await mileStoneModel.find(
      {},
      { userId: 1 }
    );
    
    // Expense userlist
    const expenseUSers = await expenseModel.find({},{userId:1, _id:1})
    
    // Combine both array
    const combinedUsers = [...targetUsers, ...expenseUSers]
    
    // Extract unique userId values using a Set
    const getData = [...new Set(combinedUsers.map(user => user.userId))]
    
    // console.log('get Miltestone', getData)
    const userData = await User.find({
      userType: { $in: ["User", "Service-Engineer"] },
    });

    // Function to find matching user data
    function findMatchingUserData(getData, userData) {
      return getData
        .map((dataItem) => {
          const matchingUser = userData.find((user) =>
            user._id.equals(new ObjectId(dataItem))
          );
          //   console.log(44, user._id)
          return {
            user: matchingUser,
          };
        })
        .filter((item) => item.user); // Filter out items where no user was found
    }

    const result = findMatchingUserData(getData, userData);
    // console.log('result', result)
    const finalResult = result.map((item) => {
      return item.user;
      // console.log(item.user)
    });
    const uniqueUserData = [...new Set(finalResult)];
    // console.log(123, uniqueUserData)
    // Calculate demo and sales
    const demoData = await demoOrSalesModel.find({ status: "Demo" });
    const salesData = await demoOrSalesModel.find({ status: "Sold" });
    // calculate targetDemoDone
    function addTargetDemoDone(uniqueUserData, demoData) {
      // Create a map to count the occurrences of each userId in demoData
      const demoCountMap = demoData.reduce((acc, demo) => {
        acc[demo.userId] = (acc[demo.userId] || 0) + 1;
        return acc;
      }, {});

      // Add targetDemoDone to each user in userData
      return uniqueUserData.map((user) => ({
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        targetDemoDone: demoCountMap[user._id] || 0,
      }));
    }

    const demoResult = addTargetDemoDone(uniqueUserData, demoData);
    // for targetSoldData
    function addTargetSoldDone(demoResult, salesData) {
      // Create a map to count the occurrences of each userId in soldData
      const soldCountMap = salesData.reduce((acc, sold) => {
        acc[sold.userId] = (acc[sold.userId] || 0) + 1;
        return acc;
      }, {});

      // Add targetSoldDone to each user in userData
      return demoResult.map((user) => ({
        ...user,
        targetSoldDone: soldCountMap[user.userId] || 0,
      }));
    }

    const updatedUserData = addTargetSoldDone(demoResult, salesData);

    // Calculate expenses of each user
    const expenseData = await expenseModel.find(
      {},
      { userId: 1, amount: 1, paymentStatus: 1 }
    );

    // Step 1: Parse amounts and create an expense map
    const expenseMap = {};

    expenseData.forEach((expense) => {
      const { userId, amount, paymentStatus } = expense;
      if (!expenseMap[userId]) {
        expenseMap[userId] = { Pending: 0, Received: 0, Declined: 0 }; // Initialize with 0
      }
      expenseMap[userId][paymentStatus] += parseFloat(amount);
    });

    // Step 2: Merge expense amounts into updatedUserData
    updatedUserData.forEach((user) => {
      const userIdStr = user.userId.toString();
      user.expenseAmount = expenseMap[userIdStr] || {
        Pending: 0,
        Received: 0,
        Declined: 0,
      };
    });
    const search = req.query.search;
    const data = updatedUserData;
    if (!!search && (search !== "" || search == null || search == undefined)) {
      const searchByTerm = (data, search) => {
        const lowerCaseSearchTerm = search.toLowerCase();
        return data.filter(user =>
            user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.email.toLowerCase().includes(lowerCaseSearchTerm)
        );
      };
      
      // const searchTerm = "rohan"; // Replace this with your search term
      const filteredUsers = searchByTerm(data, search);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "user data get successfully.",
        data: filteredUsers.length>0 ? filteredUsers : [],
      });
    }
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "user data get successfully.",
      data: updatedUserData,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getUserlist = async (req, res) => {
  try {
    // get user list
    const userData = await User.find(
      {
        $and: [
          { userType: { $in: ["User", "Service-Engineer"] } },
          { accountStatus: "Active" },
        ],
      },
      { firstName: 1, lastName: 1, email: 1, userType: 1 }
    ).sort({ firstName: 1 });
    // console.log(11, userData)
    if (userData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: [],
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully!",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.addDemo = async (req, res) => {
  try {
    const schema = Joi.object({
      // userId: Joi.string().allow("").optional(),
      deviceId: Joi.string().required(),
      contactNo: Joi.string().required(),
      hospitalName: Joi.string().required(),
      demoDuration: Joi.string().required(),
      priority: Joi.string().required(),
      description: Joi.string().allow("").optional(),
      serialNo:Joi.string().allow("").optional()
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      });
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    const currentDate = new Date();
    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const year = currentDate.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day}-${month}-${year}`;
    // check duplicate entry
    const checkData = await demoOrSalesModel.findOne({$and:[{deviceId: req.body.deviceId},{userId:loggedInUser._id},{status:"Demo"}]
    });
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "deviceId already exists.",
        data: req.body,
      });
    }
    const saveDoc = new demoOrSalesModel({
      userId: loggedInUser._id,
      deviceId: req.body.deviceId,
      contactNo: req.body.contactNo,
      hospitalName: req.body.hospitalName,
      demoDuration: req.body.demoDuration,
      priority: req.body.priority,
      status: "Demo",
      date: formattedDate,
      description: !!req.body.description ? req.body.description : "",
      isExpired: false,
      serialNo:!!req.body.serialNo ? req.body.serialNo : "",
    });
    const savedData = await saveDoc.save();
    
    // check Target assigned or not
    const targetData = await mileStoneModel.findOne({$and:[{userId:loggedInUser._id},{isExpired:false}]})
    if (!!savedData) {
      if (!targetData) {
        await mileStoneModel.findOneAndUpdate(
          {userId:loggedInUser._id},
          {
            createdBy:"6633326ae827aef92da997fe",
            startDate:formattedDate,
            endDate:"NA",
            targetDemo:"0",
            targetSales:"0",
            userId:loggedInUser._id,
            isExpired:false,
            targetStatus:"Pending"
          },{upsert:true}
        )
      }
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully!",
        data: saveDoc,
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while adding data.",
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


exports.addSold = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      contactNo: Joi.string().required(),
      hospitalName: Joi.string().required(),
      description: Joi.string().allow("").optional(),
      amount:Joi.string().required(),
      serialNo:Joi.string().allow("").optional(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      });
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    const currentDate = new Date();
    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const year = currentDate.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day}-${month}-${year}`;
    // check duplicate deviceId
    const checkData = await demoOrSalesModel.findOne({$and:[{deviceId: req.body.deviceId},{userId:loggedInUser._id},{status:"Sold"}]
    });
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "deviceId already exists.",
        data: req.body,
      });
    }
    const saveDoc = new demoOrSalesModel({
      userId: loggedInUser._id,
      deviceId: req.body.deviceId,
      contactNo: req.body.contactNo,
      hospitalName: req.body.hospitalName,
      demoDuration: "NA",
      priority: "NA",
      status: "Sold",
      date: formattedDate,
      soldDate:formattedDate,
      description: !!req.body.description ? req.body.description : "",
      isExpired: false,
      amount:!!(req.body.amount) ? req.body.amount : "",
      serialNo:!!(req.body.serialNo) ? req.body.serialNo : ""
    });
    const savedData = await saveDoc.save();
    
    // check Target assigned or not
    const targetData = await mileStoneModel.findOne({$and:[{userId:loggedInUser._id},{isExpired:false}]})
    if (!!savedData) {
      if (!targetData) {
        await mileStoneModel.findOneAndUpdate(
          {userId:loggedInUser._id},
          {
            createdBy:"6633326ae827aef92da997fe",
            startDate:formattedDate,
            endDate:"NA",
            targetDemo:"0",
            targetSales:"0",
            userId:loggedInUser._id,
            isExpired:false,
            targetStatus:"Pending"
          },{upsert:true}
        )
      }
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully!",
        data: saveDoc,
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while adding data.",
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};



exports.updateVentialtorStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      status: Joi.string().required(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      });
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    const currentDate = new Date();
    // console.log(11,req.body)
    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const year = currentDate.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day}-${month}-${year}`;
    // check Id isExists or not
    const checkData = await demoOrSalesModel.findById({ _id: req.body._id });
    if (!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong _id! data not found with given _id",
      });
    }
    // For count data
    let getMilestone = await mileStoneModel
      .find({ userId: loggedInUser._id })
      .sort({ createdAt: -1 })
      .limit(1);
    // getMilestone = getMilestone[0]
    // let targetSales = getMilestone.targetSales
    // targetSales = targetSales-1
    // let targetDemo = getMilestone.targetDemo
    // targetDemo = targetDemo-1
    // console.log(11, req.body)

    if (req.body.status == "Sold") {
      // console.log(12, req.body)
      const updateData = await demoOrSalesModel.findByIdAndUpdate(
        { _id: req.body._id },
        {
          status: req.body.status,
          soldDate: formattedDate,
        }
      );
      const alreadyClosed = await demoOrSalesModel.findOne({
        $and: [
          { userId: updateData.userId },
          { deviceId: updateData.deviceId },
          { status: "Closed" },
        ],
      });
      console.log(12, alreadyClosed);
      if (!!alreadyClosed) {
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Status added successfully!",
        });
      }
      const bodyData = new demoOrSalesModel({
        userId: checkData.userId,
        deviceId: checkData.deviceId,
        contactNo: checkData.contactNo,
        hospitalName: checkData.hospitalName,
        demoDuration: checkData.demoDuration,
        priority: checkData.priority,
        status: "Closed",
        date: checkData.date,
        description: checkData.description,
        soldDate: checkData.soldDate,
      });
      const savedData = await bodyData.save();
      if (!!savedData)
        // update sales count
        // await mileStoneModel.findByIdAndUpdate({_id:getMilestone._id},{targetSales:targetSales})
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Status added successfully!",
        });
    } else if (req.body.status == "Closed") {
      await demoOrSalesModel.findByIdAndUpdate(
        { _id: req.body._id },
        {
          status: "Closed",
          soldDate: "",
        }
      );
      // update sales count
      // await mileStoneModel.findByIdAndUpdate({_id:getMilestone._id},{targetDemo:targetDemo})
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Status added successfully!",
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Wrong _id! data not found with given _id",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.addMileStone = async (req, res) => {
  try {
    const schema = Joi.object({
      startDate: Joi.string().required(),
      endDate: Joi.string().required(),
      targetDemo: Joi.string().required(),
      targetSales: Joi.string().required(),
      userId: Joi.string().required(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      });
    }

    const currentMileStone = await mileStoneModel.find({
      $and: [{ isExpired: false }, { userId: req.body.userId }],
    });
    if (!!currentMileStone) {
      await mileStoneModel.findOneAndUpdate(
        { userId: req.body.userId },
        { isExpired: true, targetStatus: "Completed"}
      );
    }
    const saveDoc = new mileStoneModel({
      createdBy: "6633326ae827aef92da997fe",
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      targetDemo: req.body.targetDemo,
      targetSales: req.body.targetSales,
      userId: req.body.userId,
      isExpired: false,
    });
    const savedData = await saveDoc.save();
    if (!!savedData) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully!",
        data: saveDoc,
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while adding data.",
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

exports.getAllMileStone = async (req, res) => {
  try {
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // Get current date
    let getData = [];
    let expenseData = [];
    let totalAmount;

    // Check data and expire it
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(now.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    // const targetDate = new Date(formattedDate);

    const currentMileStone = await mileStoneModel.find({
      $and: [{ isExpired: false }, { userId:loggedInUser._id }],
    });
    // console.log('getMileStone', currentMileStone)
    
    // End

    if (loggedInUser.userType == "Marketing-Admin") {
      
    } else {
      getData = await mileStoneModel
        .find(
          {
            $and: [
              { userId: loggedInUser._id },
              { isExpired: false },
            ],
          },
          { __v: 0, createdAt: 0, updatedAt: 0 }
        )
        .sort({ createdAt: -1 })
        .limit(1);
      
      // console.log('getData', getData)  
      expenseData = await expenseModel.find({ userId: loggedInUser._id });
      // console.log('expenseData', expenseData)
      totalAmount = expenseData.reduce((sum, expense) => {
        return sum + parseFloat(expense.amount);
      }, 0);

      // console.log(1213, totalAmount)
      // count demo and sales
      const demoData = await demoOrSalesModel.find({
        $and: [{ userId: loggedInUser._id }, { status: "Demo" }],
      });
      // console.log('demoData', demoData) 
      const salesData = await demoOrSalesModel.find({
        $and: [{ userId: loggedInUser._id }, { status: "Sold" }],
      });
      // console.log('salesData', salesData) 

      const targetDemoDone = (demoData.length>0) ? demoData.length : 0;
      // console.log('target demo', targetDemo-demoData.length)
      const targetSalesDone = (salesData.length>0) ? salesData.length : 0;
      // console.log('target sales', targetSales-salesData.length)
      const finalData = [
        {
          _id: !!(getData.length>0) ? getData[0]._id : "--",
          startDate: !!(getData.length>0) ? getData[0].startDate : "--",
          endDate: !!(getData.length>0) ? getData[0].endDate : "--",
          targetDemo: !!(getData.length>0) ? getData[0].targetDemo : 0,
          targetDemoDone: targetDemoDone,
          targetSales: !!(getData.length>0) ? getData[0].targetSales : 0,
          targetSalesDone: targetSalesDone,
          userId: !!(getData.length>0) ? getData[0].userId : "--",
        },
      ];
      
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data get successfully!",
        data: finalData,
        data2: [{ totalExpenses: totalAmount }],
      });
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};
