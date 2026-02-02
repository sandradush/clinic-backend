const supabase = require('../config/supabase');

class Doctor {
  static async findAll() {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(doctorData) {
    const { data, error } = await supabase
      .from('doctors')
      .insert([doctorData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, doctorData) {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctorData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = Doctor;