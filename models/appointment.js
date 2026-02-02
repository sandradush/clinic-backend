const supabase = require('../config/supabase');

class Appointment {
  static async findAll() {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  static async findByPatient(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId);
    if (error) throw error;
    return data;
  }

  static async findByDoctor(doctorId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId);
    if (error) throw error;
    return data;
  }
}

module.exports = Appointment;