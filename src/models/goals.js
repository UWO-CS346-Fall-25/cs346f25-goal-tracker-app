// src/models/Goal.js
const { supabase }  = require('./supabaseClient');
const TABLE = 'newgoal';

exports.allByUser = async () => {
  //const query = supabase.from(TABLE).select('*').order('due', { ascending: true });
  //const q = id ? query.eq('id', id) : query;
  const { data, error } = await supabase
  .from(TABLE)
    .select('*')
    .order('due', { ascending: true });

  if (error) throw error;
  return data ?? [];
};


exports.findById = async (id) => {
  let q = supabase.from(TABLE).select('*').eq('id', id).single();
  // To scope by user, add user_id filter when userId provided
  if (id) {
    // Supabase doesn't allow adding another eq after single() easily, so build query without single()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      //.eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const { data, error } = await q;
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

exports.create = async ({ title, description, due }) => {
  const row = {
  goalname: title,
  description: description || null,
  due: due || null,  
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select('id')
    .single();
  if (error) throw error;
  return data; 
};

exports.update = async (id, _userId, { title, description, due }) => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      goalname: title,
      description: description ?? null,
      due: due ?? null,
    })
    .eq('id', id);
  if (error) throw error;
};

exports.destroy = async (id, _userId) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};
