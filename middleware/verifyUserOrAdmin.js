module.exports = async (req, res, next) => {
    const sessionData = req.session.user;   
    if (!sessionData)
    return res.status(200).send({
      statusCode: 401,
      statusValue:"UNAUTHORIZED",
      status: 401,
      message: "Session expired please login again.",
    });
  next();
}