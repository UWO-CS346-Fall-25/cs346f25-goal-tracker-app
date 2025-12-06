// src/models/logs.js
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

exports.forGoal = async (goalId, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });  

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
