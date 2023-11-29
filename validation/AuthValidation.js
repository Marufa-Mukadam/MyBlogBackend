import Joi from "joi";

export const loginValidation = Joi.object({
  username: Joi.string().required().min(2).max(256),
  password: Joi.string().min(8).max(100)
});

export const registrationValidation = Joi.object({
  username: Joi.string().required().min(2).max(256),
  password: Joi.string().min(8).max(100),
  email: Joi.string().email().required().max(300),
  mobile_number:Joi.string().required(),
  address: Joi.string().max(100).required(),
  pin: Joi.number().min(6).required(),
});

export const forgotpasswordValidation = Joi.object({
  newpassword: Joi.string().min(8).max(100),
  email: Joi.string().email().required().max(300),
});

