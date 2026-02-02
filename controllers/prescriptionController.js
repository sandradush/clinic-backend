let prescriptions = [
  { 
    id: 1, 
    patientId: 1, 
    doctorId: 1, 
    appointmentId: 1,
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' }
    ],
    instructions: 'Take with food',
    date: '2024-01-15'
  },
  { 
    id: 2, 
    patientId: 2, 
    doctorId: 2, 
    appointmentId: 2,
    medications: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days' }
    ],
    instructions: 'Do not exceed 1200mg per day',
    date: '2024-01-16'
  }
];

const getAllPrescriptions = (req, res) => {
  res.json(prescriptions);
};

const getPrescriptionById = (req, res) => {
  const prescription = prescriptions.find(p => p.id === parseInt(req.params.id));
  if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
  res.json(prescription);
};

const getPrescriptionsByPatient = (req, res) => {
  const patientPrescriptions = prescriptions.filter(p => p.patientId === parseInt(req.params.patientId));
  res.json(patientPrescriptions);
};

const getPrescriptionsByDoctor = (req, res) => {
  const doctorPrescriptions = prescriptions.filter(p => p.doctorId === parseInt(req.params.doctorId));
  res.json(doctorPrescriptions);
};

const createPrescription = (req, res) => {
  const { patientId, doctorId, appointmentId, medications, instructions, date } = req.body;
  
  if (!patientId || !doctorId || !medications || !Array.isArray(medications)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newPrescription = {
    id: prescriptions.length + 1,
    patientId,
    doctorId,
    appointmentId,
    medications,
    instructions,
    date: date || new Date().toISOString().split('T')[0]
  };
  
  prescriptions.push(newPrescription);
  res.status(201).json(newPrescription);
};

const updatePrescription = (req, res) => {
  const prescription = prescriptions.find(p => p.id === parseInt(req.params.id));
  if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
  
  Object.assign(prescription, req.body);
  res.json(prescription);
};

const deletePrescription = (req, res) => {
  const index = prescriptions.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Prescription not found' });
  
  prescriptions.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  createPrescription,
  updatePrescription,
  deletePrescription
};
