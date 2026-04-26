// ─────────────────────────────────────────────────────────
//  middleware/supabaseAuth.js — Supabase JWT Verification
// ─────────────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Protect routes using Supabase JWT
 */
const verifySupabaseToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return ApiResponse.unauthorized(res, "No token provided");
    }

    // Verify token using Supabase JWT Secret
    // Note: In production, you'd use the secret from Supabase Dashboard -> Settings -> API
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    // Supabase stores user ID in 'sub' field
    // We look for a user in our MongoDB that matches this Supabase ID
    // We might need to store 'supabaseId' in our User model, 
    // or assume email is the unique link.
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      return ApiResponse.unauthorized(res, "User not found in local database");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Supabase Auth Error:", error.message);
    return ApiResponse.unauthorized(res, "Invalid or expired Supabase token");
  }
};

module.exports = verifySupabaseToken;
