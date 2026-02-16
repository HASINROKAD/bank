const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unathorized access, token is misiing ",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);
    if (!user) throw new Error("User not found");

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unathorized access, token is Invalid ",
    });
  }
}

module.exports = { authMiddleware };
