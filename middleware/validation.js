const Joi = require('joi');

const validatePatient = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(0).max(150),
    phone: Joi.string().pattern(/^[\d\-\+\(\)\s]+$/).max(20),
    email: Joi.string().email()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateDoctor = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    specialty: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[\d\-\+\(\)\s]+$/).max(20),
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateAppointment = (req, res, next) => {
  const schema = Joi.object({
    patient_id: Joi.number().integer().positive().required(),
    doctor_id: Joi.number().integer().positive().required(),
    date: Joi.date().iso().required(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateAuth = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100),
    role: Joi.string().valid('admin', 'doctor', 'patient', 'user').default('user')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validatePatient,
  validateDoctor,
  validateAppointment,
  validateAuth
};