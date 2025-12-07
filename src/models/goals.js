const { supabase } = require('./supabaseClient');
const TABLE = 'newgoal';

// Goal model helpers that wrap Supabase queries for the newgoal table

exports.allByUser = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('due', { ascending: true }); // backlog sorted by due date

  if (error) throw error;
  return data ?? [];
};

exports.findById = async (id, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle(); // ensures row belongs to requester
  if (error) throw error;
  return data || null;
};

exports.create = async ({ title, description, due, user_id }) => {
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
    .single(); // return new goal id for redirecting

  if (error) throw error;
  return data;
};

exports.update = async (id, userId, { title, description, due }) => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      goalname: title,
      description: description ?? null,
      due: due ?? null,
    })
    .eq('id', id)
    .eq('user_id', userId); // safety: only owner can update
  if (error) throw error;
};

exports.destroy = async (id, userId) => {
  const { error } = await supabase

    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // scoped delete
  if (error) throw error;
};
