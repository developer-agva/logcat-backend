module.exports = async (req, res, next) => {
    const sessionData = req.session.user;
  
    if (!sessionData)
      return res.status(200).send({
        statusCode: "UNAUTHORIZED",
        statusValue: 401,
        status: 401,
        message: "Unauthorized, No session found.",
      });
  
    if (sessionData.userType != "Admin")
      return res.status(200).send({
        statusCode: "UNAUTHORIZED",
        statusValue: 401,
        status: 401,
        message: "Unauthorized, Wrong session is used.",
      });
    next();
  };
  