const supabase = require('../config/supabase');

const getAllDoctors = async (req, res) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Doctor not found' });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Doctor not found' });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Doctor not found' });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};