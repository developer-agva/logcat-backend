const User = require("../model/users");

let redisClient = require("../config/redisInit");

const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);

const isAuth = async (req, res, next) => {
  try {
    // console.log(req.headers["authorization"])
    if (!req.headers["authorization"]) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You are not logged in!!",
            msg: "You are not logged in!!",
            type: "AuthenticationError",
          },
        },
      });
    }
    // console.log(111, req.headers["authorization"])
    const token = req.headers["authorization"].split(' ')[1];
    // console.log("token:", token)
    if (!token) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "User is not authenticated.",
            msg: "User is not authenticated.",
            type: "AuthenticationError",
          },
        },
      }); // NJ-changes 13 Apr
    }

    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(verified)
    if (!verified) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "User is not authenticated.",
            msg: "User is not authenticated.",
            type: "AuthenticationError",
          },
        },
      });
    }

    req.user = verified.user;
    // console.log("req user", req.user);
    req.jti = verified.jti;

    // proceed after authentication
    next();
  } catch (err) {
    // console.log("err",err)
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

const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log("Details of user", user);
    // console.log(user.isSuperAdmin);

    if (user.userType !== "Super-Admin") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }

  // console.log("request created",req.user)
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log("Details of user", user);
      //  console.log("Admin details :", user);
    if (user.userType !== "Hospital-Admin") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }

  // console.log("request created",req.user)
};

const isNurse = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log("Details of user", user);
      //  console.log("Admin details :", user);
    if (user.userType !== "Nurse") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }

  // console.log("request created",req.user)
};

const isProduction = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log("Details of user", user);
      //  console.log("Admin details :", user);
    if (user.userType !== "Production") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }

  // console.log("request created",req.user)
};

const isDispatch = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log("Details of user", user);
      //  console.log("Admin details :", user);
    if (user.userType !== "Dispatch") {
      // console.log(user)
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }

  // console.log("request created",req.user)
};

/** 
 * for Support User role
*/
const isSupport = async (req, res, next) => {
  try {
     const user = await User.findById(req.user);
    //  console.log(user);
    // check userType
    if (user.userType !== "Support") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      })
    }
    // call to next fun
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }
}

/**
 * for Service-Engineer role
 */
const isServiceEng = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log(12,user);
    // check userType
    if (user.userType !== "Service-Engineer") {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      })
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    });
  }
}

/**
 * for User role
 */
const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    // console.log(user);
    // check userType
    if (user.userType !== "User") {
      return res.status(403).json({
        status:0,
        data:{
          err: {
            generatedTime: new Date(),
            errMsg: "You dont have permission to access this.",
            msg: "You dont have permission to access this.",
            type: "AuthenticationError",
          },
        },
      })
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: err.message,
          msg: "Internal Server Error",
          type: err.name,
        },
      },
    })
  }
}


module.exports = { isAuth, isSuperAdmin, isAdmin, isDispatch, isNurse, isProduction, isSupport, isServiceEng, isUser};
