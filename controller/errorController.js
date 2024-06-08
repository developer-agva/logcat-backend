const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use anothe value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `Invalid input data. ${err.body}`;
  return new AppError(message, 400);
};

// DEVELOPMENT ENV ERROR

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: -1,
    data: {
      err: {
        generatedTime: new Date(),
        errMsg: err.stack,
        msg: err.message,
        type: err.type || "ServerError",
      },
    },
  });
};

// PRODUCTION ENV ERROR

const sendErrorProd = (err, res) => {
  // console.log(err)
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: -1,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: "Internal Server Error.",
          msg: "Internal Server Error.",
          type: "ServerError",
        },
      },
    });
  } else {
    // 1) Log error
    console.error("ERROR: ", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode;
  err.status = err.status || "error";
  // IF ERROR COMES IN DEVELOPMENT ENV
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  // IF ERROR COMES IN PRODUCTION ENV
  else if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    else error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
