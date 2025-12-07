const { supabase } = require('./supabaseClient');
const TABLE = 'milestones';

// Fetch all milestones tied to a goal, scoped by owning user
exports.forGoal = async (goalId, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('due', { ascending: true }); // keep soonest items first
  //.order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
};

// Create a milestone for this goal + user
exports.create = async ({ goalId, userId, title, dueDate }) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      goal_id: goalId,
      user_id: userId,
      title,
      due: dueDate || null,
      is_complete: false, // default state
    })
    .select('id')
    .single(); // need new id for redirect anchors

  if (error) throw error;
  return data;
};

exports.toggleComplete = async (id, userId) => {
  // First fetch the user-owned milestone to read current completion flag
  const { data, error } = await supabase
    .from(TABLE)
    .select('is_complete')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Flip the boolean and persist
  const { error: updateError } = await supabase
    .from(TABLE)
    .update({ is_complete: !data.is_complete })
    .eq('id', id)
    .eq('user_id', userId);

  if (updateError) throw updateError;
};

exports.destroy = async (id, userId) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // guard so users delete only their milestones

  if (error) throw error;
};
