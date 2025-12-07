const { supabase } = require('./supabaseClient');
const TABLE = 'newgoal';

module.exports = {
  async allByUser(userId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('due', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  async create({ title, description, due, user_id }) {
    const row = {
      goalname: title,
      description: description || null,
      due: due || null,
      user_id,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userId, { title, description, due }) {
    const { error } = await supabase
      .from(TABLE)
      .update({
        goalname: title,
        description: description || null,
        due: due || null,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async destroy(id, userId) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};