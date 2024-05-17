const expenseModel = require('../model/expenseModel');
const User = require('../model/users');
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
const Joi = require('joi');
const demoOrSalesModel = require('../model/demoOrSalesModel');
const mileStoneModel = require('../model/mileStoneModel');
const { ObjectId } = require('mongodb');


exports.addExpense = async (req, res) => {
    try {
        const schema = Joi.object({
            // userId: Joi.string().allow("").optional(),
            amount: Joi.string().required(),
            description: Joi.string().required(),
            time : Joi.string().allow("").optional(),
            isAvlBill: Joi.string().allow("").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        const currentDate = new Date();
        // Extract day, month, and year
        const day = currentDate.getDate().toString().padStart(2,'0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
        const year = currentDate.getFullYear();
        // Format the date as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;
        
        const saveDoc = new expenseModel({
            userId:loggedInUser._id,
            amount:req.body.amount,
            description:req.body.description,
            time:req.body.time,
            date:formattedDate,
            isAvlBill:req.body.isAvlBill,
        })
        const savedData = await saveDoc.save();
        if (!!savedData) {
            return res.status(201).json({
                statusCode: 201,
                statusValue: "SUCCESS",
                message: "Data added successfully!",
                data:saveDoc
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Error! while adding data.",
            data:req.body
        })
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}

exports.updateExpenseById = async (req, res) => {
    try {
        // Get current date
        const currentDate = new Date();
        // Extract day, month, and year
        const day = currentDate.getDate().toString().padStart(2,'0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
        const year = currentDate.getFullYear();
        // Format the date as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;

        const checkData = await expenseModel.findById({_id:req.params.id})
        if (!checkData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Wrong Id.",
            }) 
        }
        const updateDoc = await expenseModel.findOneAndUpdate({_id:req.params.id},{
            amount:!!(req.body.amount) ? req.body.amount : checkData.amount,
            description:!!(req.body.description) ? req.body.description : checkData.description,
            time:!!(req.body.time) ? req.body.time : checkData.time,
            date:formattedDate
        }, {upsert: true})
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Data added successfully!",
            data:updateDoc
        }) 
        
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}

exports.getAllExpenses = async (req, res) => {
    try {
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        let expenseData = [];
        if (loggedInUser.userType !== "Marketing-Admin") {
            expenseData = await expenseModel.find({userId:loggedInUser._id},{__v:0, createdAt:0, updatedAt:0}).sort({createdAt:-1})
            if (!!expenseData) {
                return res.status(200).json({
                    statusCode: 200,
                    statusValue: "SUCCESS",
                    message: "Data get successfully!",
                    data:expenseData
                }) 
            }
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: []
            }) 
        }
        expenseData = await expenseModel.find({},{__v:0, createdAt:0, updatedAt:0})
        if (!!expenseData) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully!",
                data:expenseData
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: []
        })
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}

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
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        let demoData;
        if (loggedInUser.userType !== "Marketing-Admin") {
            demoData = await demoOrSalesModel.find({$and:[{userId:loggedInUser._id},{status:{$ne:"Sold"}}]},{__v:0, createdAt:0, updatedAt:0})
            if (req.query.search) {
                demoData = await demoOrSalesModel.find({
                    $and:[
                        {userId:loggedInUser._id},
                        {status:{$ne:"Sold"}},
                        {
                            $or: [
                              { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
                              { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                            ]
                        }
                    ]
                },
                {__v:0, createdAt:0, updatedAt:0})
            }
            if (demoData.length<1) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message: "Data not found.",
                    data: []
                }) 
            }
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully!",
                data:demoData
            }) 
        }
        demoData = await demoOrSalesModel.find({status:{$ne:"Sold"}},{__v:0, createdAt:0, updatedAt:0})
        if (req.query.search) {
            demoData = await demoOrSalesModel.find({
                $and:[
                    // {userId:loggedInUser._id},
                    {status:{$ne:"Sold"}},
                    {
                        $or: [
                          { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
                          { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                        ]
                    }
                ]
            },
            {__v:0, createdAt:0, updatedAt:0})
        }
        if (demoData.length<1) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: []
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully!",
            data:demoData
        })  
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}

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
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        let demoData;
        if (loggedInUser.userType !== "Marketing-Admin") {
            demoData = await demoOrSalesModel.find({$and:[{userId:loggedInUser._id},{status:"Sold"}]},{__v:0, createdAt:0, updatedAt:0})
            if (req.query.search) {
                demoData = await demoOrSalesModel.find({
                    $and:[
                        {userId:loggedInUser._id},
                        {status:{$ne:"Sold"}},
                        {
                            $or: [
                              { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
                              { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                            ]
                        }
                    ]
                },
                {__v:0, createdAt:0, updatedAt:0})
            }
            if (demoData.length<1) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message: "Data not found.",
                    data: []
                }) 
            }
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully!",
                data:demoData
            }) 
        }
        demoData = await demoOrSalesModel.find({status:"Sold"},{__v:0, createdAt:0, updatedAt:0})
        if (req.query.search) {
            demoData = await demoOrSalesModel.find({
                $and:[
                    // {userId:loggedInUser._id},
                    {status:"Sold"},
                    {
                        $or: [
                          { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
                          { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                        ]
                    }
                ]
            },
            {__v:0, createdAt:0, updatedAt:0})
        }
        if (demoData.length<1) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: []
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully!",
            data:demoData
        })  
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}

exports.getTotalDataCount = async (req, res) => {
    try {
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        const getMilestoneData = await mileStoneModel.find({createdBy:loggedInUser._id})
        const getExpenseData = await expenseModel.find({})
        const totalDemo = getMilestoneData.reduce((sum, mileStone) => {
            return sum+parseFloat(mileStone.targetDemo)
        }, 0)
        console.log(11, totalDemo)
        const totalSales = getMilestoneData.reduce((sum, mileStone) => {
            return sum+parseFloat(mileStone.targetSales)
        }, 0)
        console.log(12, totalSales)
        const totalExpense = getExpenseData.reduce((sum, expense) => {
            return sum+parseFloat(expense.amount)
        }, 0)
        console.log(13, totalExpense)
        // total demo done and total sales done
        const totalDemoDone = (await demoOrSalesModel.find({status:"Closed"}))
        const totalSalesDone = (await demoOrSalesModel.find({status:"Sold"}))
        const finalObj = {
            "totalDemo":totalDemo,
            "totalDemoDone":!!(totalDemoDone) ? totalDemoDone.length : 0, 
            "totalSales":totalSales,
            "totalSalesDone":!!(totalSalesDone) ? totalSalesDone.length : 0,
            "totalExpense":totalExpense
        }
        if (!!finalObj) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully!",
                data:[finalObj]
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: {}
        }) 
         
        
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.getUserData = async (req, res) => {
    try {
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // user data
        let getData = await mileStoneModel.find({createdBy:loggedInUser._id},{userId:1})
        const userData = await User.find({userType:{"$in":["User","Service-Engineer"]}})
        // Function to find matching user data
        function findMatchingUserData(getData, userData) {
            return getData.map(dataItem => {
              const matchingUser = userData.find(user => user._id.equals(new ObjectId(dataItem.userId)));
            //   console.log(44, user._id)
              return {
                user: matchingUser }
        
            }).filter(item => item.user); // Filter out items where no user was found
          }
          
          const result = findMatchingUserData(getData, userData);
          const finalResult = result.map((item) => {
            return item.user;
            // console.log(item.user)
          })
          const uniqueColors = [...new Set(finalResult)];
        
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: uniqueColors
        }) 
        
        
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.getUserData = async (req, res) => {
    try {
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // user data
        let getData = await mileStoneModel.find({createdBy:loggedInUser._id},{userId:1})
        const userData = await User.find({userType:{"$in":["User","Service-Engineer"]}})
        // Function to find matching user data
        function findMatchingUserData(getData, userData) {
            return getData.map(dataItem => {
              const matchingUser = userData.find(user => user._id.equals(new ObjectId(dataItem.userId)));
            //   console.log(44, user._id)
              return {
                user: matchingUser }
        
            }).filter(item => item.user); // Filter out items where no user was found
          }
          
          const result = findMatchingUserData(getData, userData);
          const finalResult = result.map((item) => {
            return item.user;
            // console.log(item.user)
          })
          const uniqueUserData = [...new Set(finalResult)];
          // Calculate demo and sales
          const demoData = await demoOrSalesModel.find({status:"Closed"})
          const salesData = await demoOrSalesModel.find({status:"Sold"})
          // calculate targetDemoDone
          function addTargetDemoDone(uniqueUserData, demoData) {
            // Create a map to count the occurrences of each userId in demoData
            const demoCountMap = demoData.reduce((acc, demo) => {
              acc[demo.userId] = (acc[demo.userId] || 0) + 1;
              return acc;
            }, {});
          
            // Add targetDemoDone to each user in userData
            return uniqueUserData.map(user => ({
              "userId":user._id,
              "firstName":user.firstName,
              "lastName":user.lastName,
              "email":user.email,
              "targetDemoDone": demoCountMap[user._id] || 0
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
            return demoResult.map(user => ({
              ...user,
              targetSoldDone: soldCountMap[user.userId] || 0
            }));
          }
          
          const updatedUserData = addTargetSoldDone(demoResult, salesData);
          console.log(updatedUserData);  
        
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "user data get successfully.",
            data: updatedUserData
        }) 
        
        
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.getUserlist = async (req, res) => {
    try {
        // get user list
        const userData = await User.find({$and:[{userType:{$in:["User","Service-Engineer"]}},{accountStatus:"Active"}]},{firstName:1,lastName:1,email:1,userType:1}).sort({firstName:1})
        // console.log(11, userData)
        if (userData.length<1) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: []
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully!",
            data: userData
        })  
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.addDemo = async (req, res) => {
    try {
        const schema = Joi.object({
            // userId: Joi.string().allow("").optional(),
            deviceId: Joi.string().required(),
            contactNo: Joi.string().required(),
            hospitalName : Joi.string().required(),
            demoDuration: Joi.string().required(),
            priority: Joi.string().required(),
            description: Joi.string().allow("").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        const currentDate = new Date();
        // Extract day, month, and year
        const day = currentDate.getDate().toString().padStart(2,'0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
        const year = currentDate.getFullYear();
        // Format the date as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;
        // check duplicate deviceId
        const checkData = await demoOrSalesModel.findOne({deviceId:req.body.deviceId})
        if (!!checkData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "deviceId already exists.",
                data:req.body
            })
        }
        const saveDoc = new demoOrSalesModel({
            userId:loggedInUser._id,
            deviceId:req.body.deviceId,
            contactNo:req.body.contactNo,
            hospitalName:req.body.hospitalName,
            demoDuration:req.body.demoDuration,
            priority:req.body.priority,
            status:"Ongoing",
            date: formattedDate,
            description:!!(req.body.description) ? req.body.description : ""
        })
        const savedData = await saveDoc.save();
        // let getMilestone = await mileStoneModel.find({userId:loggedInUser._id}).sort({createdAt:-1}).limit(1);
        // getMilestone = getMilestone[0]
        // let targetDemo = getMilestone.targetDemo
        // targetDemo = targetDemo-1
        if (!!savedData) {
            // await mileStoneModel.findByIdAndUpdate({_id:getMilestone._id},{targetDemo:targetDemo})
            return res.status(201).json({
                statusCode: 201,
                statusValue: "SUCCESS",
                message: "Data added successfully!",
                data:saveDoc
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Error! while adding data.",
            data:req.body
        })
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.updateVentialtorStatus = async (req, res) => {
    try {
        const schema = Joi.object({
            _id: Joi.string().required(),
            status: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        const currentDate = new Date();
        // console.log(11,req.body)
        // Extract day, month, and year
        const day = currentDate.getDate().toString().padStart(2,'0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
        const year = currentDate.getFullYear();
        // Format the date as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;
        // check Id isExists or not
        const checkData = await demoOrSalesModel.findById({_id:req.body._id})
        if (checkData.length<1) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Wrong _id! data not found with given _id",
            })
        }
        // For count data
        let getMilestone = await mileStoneModel.find({userId:loggedInUser._id}).sort({createdAt:-1}).limit(1);
        // getMilestone = getMilestone[0]
        // let targetSales = getMilestone.targetSales
        // targetSales = targetSales-1
        // let targetDemo = getMilestone.targetDemo
        // targetDemo = targetDemo-1

        if (req.body.status == "Sold") {
            await demoOrSalesModel.findByIdAndUpdate({_id:req.body._id},{
                status:"Sold",
                soldDate: formattedDate,
            })
            await demoOrSalesModel.findOneAndUpdate({_id:"6646dd2913563a908c254adf"},{
                userId:checkData.userId,
                deviceId:checkData.deviceId,
                contactNo:checkData.contactNo,
                hospitalName:checkData.hospitalName,
                demoDuration:checkData.demoDuration,
                priority:checkData.priority,
                status:"Closed",
                date:checkData.date,
                description:checkData.description,
                soldDate:checkData.soldDate,
                createdAt:checkData.createdAt,
            },{upsert:true})
            // update sales count
            // await mileStoneModel.findByIdAndUpdate({_id:getMilestone._id},{targetSales:targetSales})
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Status added successfully!",
            }) 
        } else if (req.body.status == "Closed") {
            await demoOrSalesModel.findByIdAndUpdate({_id:req.body._id},{
                status:"Closed",
                soldDate: "",
            })
            // update sales count
            // await mileStoneModel.findByIdAndUpdate({_id:getMilestone._id},{targetDemo:targetDemo})
            return res.status(201).json({
                statusCode: 201,
                statusValue: "SUCCESS",
                message: "Status added successfully!",
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Wrong _id! data not found with given _id",
        })

    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}



exports.addMileStone = async (req, res) => {
    try {
        const schema = Joi.object({
            startDate:Joi.string().required(),
            endDate:Joi.string().required(),
            targetDemo:Joi.string().required(),
            targetSales:Joi.string().required(),
            userId:Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        // Format the date as "dd-mm-yyyy"
        // console.log(11, req.body)
        const saveDoc = new mileStoneModel({
            createdBy:loggedInUser._id,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            targetDemo:req.body.targetDemo,
            targetSales:req.body.targetSales,
            userId:req.body.userId,
            // totalDemoSet:req.body.targetDemo,
        })
        const savedData = await saveDoc.save();
        if (!!savedData) {
            return res.status(201).json({
                statusCode: 201,
                statusValue: "SUCCESS",
                message: "Data added successfully!",
                data:saveDoc
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Error! while adding data.",
            data:req.body
        })
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}


exports.getAllMileStone = async (req, res) => {
    try {
        // for expense userId
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // Get current date
        let getData = [];
        let expenseData = [];
        let totalAmount;
        if (loggedInUser.userType == "Marketing-Admin") {
            // for moileStone count
            // getData = await mileStoneModel.find({createdBy:loggedInUser._id},{__v:0, createdAt:0, updatedAt:0})
            
            // // calculate sum of expenses
            // expenseData = await expenseModel.find()
            // totalAmount = expenseData.reduce((sum, expense) => {
            //     return sum+parseFloat(expense.amount);
            // }, 0)
            // // console.log(11,totalAmount)

            // if (getData.length<1) {
            //     return res.status(400).json({
            //         statusCode: 400,
            //         statusValue: "FAIL",
            //         message: "Data not found.",
            //         data: [],
            //     })
            // }
            // return res.status(200).json({
            //     statusCode: 200,
            //     statusValue: "SUCCESS",
            //     message: "Data get successfully!",
            //     data:getData,
            //     data2:[{totalExpenses:totalAmount}]
            // }) 
        } else {
            getData = await mileStoneModel.find({userId:loggedInUser._id},{__v:0, createdAt:0, updatedAt:0}).sort({createdAt:-1}).limit(1)
            expenseData = await expenseModel.find({userId:loggedInUser._id})
            totalAmount = expenseData.reduce((sum, expense) => {
                return sum+parseFloat(expense.amount);
            }, 0)
            // count demo and sales
            const demoData = await demoOrSalesModel.find({$and:[{userId:loggedInUser._id},{status:"Closed"}]})
            const salesData = await demoOrSalesModel.find({$and:[{userId:loggedInUser._id},{status:"Sold"}]})
            const targetDemo = getData[0].targetDemo
            console.log(12, targetDemo-demoData.length)
            const targetSales = getData[0].targetSales
            console.log(13, targetSales-salesData.length)
            const finaData = [
                {
                    "_id":getData[0]._id,
                    "startDate":getData[0].startDate,
                    "endDate":getData[0].endDate,
                    "targetDemo":getData[0].targetDemo,
                    "targetDemoDone":salesData.length,
                    "targetSales":getData[0].targetSales,
                    "targetSalesDone":targetSales.length,
                    "userId":getData[0].userId,
                }
            ]
            // console.log(12,totalAmount)
            if (getData.length<1) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message: "Data not found.",
                    data: [],
                    
                })
            }
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully!",
                data:finaData,
                data2:[{totalExpenses:totalAmount}]
            }) 
        }
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: err.stack,
            }
        })
    }
}
