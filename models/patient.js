const supabase = require('../config/supabase');

class Patient {
  static async findAll() {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, patientData) {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = Patient;