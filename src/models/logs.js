// src/models/logs.js - Supabase wrapper for progress log entries
/*const { supabase } = require('./supabaseClient');

const TABLE = 'logs';

exports.allForGoal = async (goalId, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

exports.create = async ({ goalId, userId, note, metricName, metricValue }) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      goal_id: goalId,
      user_id: userId,
      note,
      metric_name: metricName || null,
      metric_value: metricValue ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
};
*/
const { supabase } = require('./supabaseClient');

const TABLE = 'logs';

// Fetches all log entries for a given goal, scoped to requesting user
exports.forGoal = async (goalId, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // newest entries first

  if (error) throw error;
  return data || [];
};

// Inserts a new progress log row tied to goal + user
exports.create = async ({ goalId, userId, note, metricName, metricValue }) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      goal_id: goalId,
      user_id: userId,
      note,
      metric_name: metricName || null,
      metric_value: metricValue ?? null,
    })
    .select('id')
    .single(); // return generated ID for controller use

  if (error) throw error;
  return data;
};
