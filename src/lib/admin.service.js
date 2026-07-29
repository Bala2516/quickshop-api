import { pool } from "../config/db.js";

export const isAdmin = async (userId) => {
  const [rows] = await pool.execute(
    `
    SELECT is_admin
    FROM users
    WHERE id = ?
    `,
    [userId],
  );

  return rows.length && rows[0].is_admin;
};
