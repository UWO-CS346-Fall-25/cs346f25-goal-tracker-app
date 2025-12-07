/**
 * User Model
 * Handles database operations for the `users` table.
 */

const { supabase } = require('./supabaseClient');

class User {
  /**
   * Get all users (admin/debug use)
   */
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Find a user by ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, created_at, updated_at')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  /**
   * Update profile fields
   */
  static async updateProfile(id, { email, username } = {}) {
    const patch = {};
    if (email) patch.email = email;
    if (username) patch.display_name = username;

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', id)
      .select('id, email, display_name, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a user profile row
   */
  static async deleteProfile(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = User;
