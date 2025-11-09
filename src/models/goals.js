// src/models/Goal.js
const supabase = require('./db');
const TABLE = 'goals';

exports.allByUser = async (_userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data || [];
};

exports.findById = async (id, _userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

exports.create = async ({ userId, title, description, targetDate }) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      // user_id: userId, // add later if you store owner
      title,
      description: description || null,
      target_date: targetDate || null,
      progress: 0,
      archived: false,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data; 
};

exports.update = async (id, _userId, { title, description, targetDate, progress, archived }) => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      title,
      description: description ?? null,
      target_date: targetDate ?? null,
      progress: Number(progress ?? 0),
      archived: !!archived,
    })
    .eq('id', id);
  if (error) throw error;
};

exports.destroy = async (id, _userId) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};
