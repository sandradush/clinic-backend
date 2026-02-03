const validatePatient = (req, res, next) => {
  const { name, age, phone } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Invalid or missing "name"' });
  if (age === undefined || typeof age !== 'number') return res.status(400).json({ error: 'Invalid or missing "age"' });
  if (!phone || typeof phone !== 'string') return res.status(400).json({ error: 'Invalid or missing "phone"' });
  next();
};

module.exports = { validatePatient };
