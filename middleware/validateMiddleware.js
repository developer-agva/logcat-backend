const { checkMD5 } = require("../helper/helperFunctions.js");

const isDeviceRegistered = async (req, res, next) => {
  try {
    if (!req.headers["authorization"])
      throw { message: "Provide device authorization" };
    const projectMD5 = req.headers["authorization"].split(" ")[1];
    const tokenKey = req.headers["authorization"].split(" ")[0];
    // console.log(`${projectMD5} ${tokenKey}`);

    if (tokenKey !== "AgVa_Logger") {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "Invalid token.",
            msg: "Invalid token.",
            type: "JWT Error",
          },
        },
      });
    }

    if (!projectMD5) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "Project not found",
            msg: "Project not found",
            type: "Internal Server Error",
          },
        },
      });
    }

    // proceed after authentication
    const isVerified = checkMD5(`${projectMD5}`);
    if (!isVerified) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "Your are passing invalid project token!",
            msg: "Your are passing invalid project token!",
            type: "JWT Error",
          },
        },
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error.",
          type: err.name,
        },
      },
    });
  }
};

const validateHeader = async (req, res, next) => {
  try {
    req.contentType = "";
    if (req.headers["content-type"].includes("application/json")) {
      if (!req.body.log || !req.body.device) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: "Log details or device details missing.",
              msg: "Log details or device details missing.",
              type: "ValidationError",
            },
          },
        });
      } else req.contentType = "json";
    }

    if (req.headers["content-type"].includes("multipart/form-data")) {
      if (!req.file || !req.file["path"]) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: "Log file missing.",
              msg: "Log file missing.",
              type: "ValidationError",
            },
          },
        });
      } else req.contentType = "formData";
    }

    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error.",
          type: err.name,
        },
      },
    });
  }
};

module.exports = {
  isDeviceRegistered,
  validateHeader,
};
