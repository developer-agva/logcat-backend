// projectController.js
const Joi = require('joi');
const projectModel = require('../model/projectModel');
const featuredProductModel = require('../model/featuredProductModel');


/**
 * api      POST @/projects/addNewProject
 * desc     @projects for logger access only
 */
const addNewProject = async (req, res) => {
  const newProject = new projectModel(req.body);
  try {
    const savedProject = await newProject.save();
    if (!!savedProject) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Project has been added successfully.",
        data: savedProject
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Validation error."
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
    });
  }
}

const getAllProjects = async (req, res) => {
  try {
    const projectList = await projectModel.find({}, {__v:0});
   
    if (projectList.length) {
      res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Project list get successfully.",
        data: projectList,
        // data2:featuredProdList
      })
    }
    res.status(400).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Data not found."
    })
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const getAllProducts = async (req, res) => {
  try {
    const projectList = await projectModel.find({}, {__v:0, provide_device_type:0});
    const featuredProdList = await featuredProductModel.find({},{__v:0});
    let finalArrList = [...projectList, ...featuredProdList]
    // console.log(projectList) 
    if (!!projectList) {
      return res.status(200).json({
        statusCode: 200,
        statusCode:"SUCCESS",
        message:"Product list get successfully.",
        data:finalArrList,
        // {
        //   bannerProduct:projectList,
        //   featuredProduct:featuredProdList
        // },
        // data2:{feafeaturedProdList}
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusCode:"FAIL",
      message:"No data found.",
      data:[]
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
    });
  }
}

module.exports = {
    addNewProject,
    getAllProjects,
    getAllProducts
}