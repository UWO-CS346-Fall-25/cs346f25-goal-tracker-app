const { supabase } = require('./supabaseClient');
const TABLE = 'milestones';

// Get all milestones for a goal that belong to a user
exports.forGoal = async (goalId, userId) => {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', userId)
        .order('due', { ascending: true })
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
            is_complete: false,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data;
};

exports.toggleComplete = async (id, userId) => {
    // Get current value
    const { data, error } = await supabase
        .from(TABLE)
        .select('is_complete')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error) throw error;

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
        .eq('user_id', userId);

    if (error) throw error;
};
