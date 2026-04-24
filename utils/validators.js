// ─────────────────────────────────────────────────────────
//  utils/validators.js — Joi Validation Schemas
// ─────────────────────────────────────────────────────────
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      "any.required": "Password is required",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Please confirm your password",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      "any.required": "New password is required",
    })
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "any.required": "OTP is required",
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    )
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters",
      "string.pattern.base":
        "New password must contain at least one uppercase, one lowercase, one number, and one special character",
      "any.required": "New password is required",
    })
});

// ─── Customer Schemas ─────────────────────────────────────
const addressSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
  country: Joi.string().default("India"),
  isDefault: Joi.boolean().default(false)
});

const addToCartSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const checkoutSchema = Joi.object({
  addressId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  paymentMethod: Joi.string().valid("cod", "card", "upi", "net_banking").required(),
  customerNotes: Joi.string().max(500).allow("", null)
});

const reviewSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow("", null),
  images: Joi.array().items(Joi.string().uri())
});

// ─── Garage Schemas ─────────────────────────────────────
const garageProfileSchema = Joi.object({
  businessName: Joi.string().required(),
  servicesOffered: Joi.array().items(Joi.string()),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    pincode: Joi.string().length(6)
  }),
  gstDetails: Joi.object({
    gstNumber: Joi.string(),
    panNumber: Joi.string()
  })
});

const staffSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  role: Joi.string().valid("mechanic", "manager", "receptionist", "admin"),
  specialization: Joi.array().items(Joi.string()),
  salary: Joi.number()
});

const vehicleSchema = Joi.object({
  ownerName: Joi.string().required(),
  ownerPhone: Joi.string().required(),
  registrationNumber: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number(),
  fuelType: Joi.string().valid("petrol", "diesel", "cng", "electric")
});

const serviceJobSchema = Joi.object({
  vehicleId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  serviceType: Joi.string().valid("general_service", "repair", "body_work", "inspection", "emergency").required(),
  scheduledDate: Joi.date().required(),
  complaints: Joi.array().items(Joi.string())
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
  changePasswordSchema,
  addressSchema,
  addToCartSchema,
  checkoutSchema,
  reviewSchema,
  garageProfileSchema,
  staffSchema,
  vehicleSchema,
  serviceJobSchema
};
