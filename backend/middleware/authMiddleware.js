const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Distributor = require("../models/Distributor");
const Garage = require("../models/Garage");
const Customer = require("../models/Customer");
const User = require("../models/User"); // Keeping for backward compatibility if needed
const ApiResponse = require("../utils/ApiResponse");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json(new ApiResponse(false, "Not authorized — no token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    let user;
    const role = decoded.role;

    // Fetch user from appropriate model based on role in token
    if (role === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (role === "distributor") {
      user = await Distributor.findById(decoded.id);
    } else if (role === "garage") {
      user = await Garage.findById(decoded.id);
    } else if (role === "customer") {
      user = await Customer.findById(decoded.id);
    } else {
      // Fallback to general User model
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json(new ApiResponse(false, "User no longer exists"));
    }

    if (!user.isActive) {
      return res.status(401).json(new ApiResponse(false, "Your account has been deactivated"));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(new ApiResponse(false, "Token expired"));
    }
    return res.status(401).json(new ApiResponse(false, "Authentication failed"));
  }
};

module.exports = { protect };
