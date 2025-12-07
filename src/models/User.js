/**
 * User Model
 *
 * This model handles all database operations related to users.
 * Use parameterized queries ($1, $2, etc.) to prevent SQL injection.
 *
 * Example methods:
 * - findAll(): Get all users
 * - findById(id): Get user by ID
 * - findByEmail(email): Get user by email
 * - create(userData): Create a new user
 * - update(id, userData): Update a user
 * - delete(id): Delete a user
 */

const { supabase } = require('./supabaseClient');

// Shared helpers for interacting with the `users` table

class User {
  /**
   * Find all users
   * @returns {Promise<Array>} Array of users
   */
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, created_at')
      .order('created_at', { ascending: false }); // newest accounts first
    if (error) throw error;
    return data || [];
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<object|null>} User object or null
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
   * Find user by email (including password for authentication)
   * @param {string} email - User email
   * @returns {Promise<object|null>} User object or null
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
   * Create a new user
   * @param {object} userData - User data { username, email, password }
   * @returns {Promise<object>} Created user object
   */
  static async createProfile({ id, email, username }) {
    const { data, error } = await supabase
      .from('users')
      .insert({ id, email, display_name: username })
      .select('id, email, display_name, created_at')
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {object} userData - User data to update
   * @returns {Promise<object>} Updated user object
   */
  static async updateProfile(id, { email, username } = {}) {
    const patch = {}; // Only send fields supplied by caller
    if (email !== undefined) patch.email = email;
    if (username !== undefined) patch.display_name = username;

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
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async deleteProfile(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = User;
