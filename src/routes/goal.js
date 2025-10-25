// src/models/Goal.js
const db = require('./db');

module.exports = {
    async allByUser(userId) {
        const { rows } = await db.query(
            `SELECT id, title, description, target_date, progress, archived, created_at
       FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    },

    async findById(id, userId) {
        const { rows } = await db.query(
            `SELECT id, title, description, target_date, progress, archived, created_at
       FROM goals WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return rows[0];
    },

    async create({ userId, title, description, targetDate }) {
        const { rows } = await db.query(
            `INSERT INTO goals (user_id, title, description, target_date)
       VALUES ($1, $2, $3, $4) RETURNING id`,
            [userId, title, description, targetDate || null]
        );
        return rows[0];
    },

    async update(id, userId, { title, description, targetDate, progress, archived }) {
        await db.query(
            `UPDATE goals
         SET title = $1, description = $2, target_date = $3, progress = $4, archived = $5
       WHERE id = $6 AND user_id = $7`,
            [title, description, targetDate || null, progress ?? 0, archived ?? false, id, userId]
        );
    },

    async destroy(id, userId) {
        await db.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2`, [id, userId]);
    }
};
