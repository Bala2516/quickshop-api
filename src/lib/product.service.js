import { pool } from "../config/db.js";

export const getProductDetails = async (productId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      p.id,
      p.name,
      p.price,
      c.category_name
    FROM products p
    JOIN category c
      ON p.category_id = c.id
    WHERE p.id = ?
    `,
    [productId]
  );

  return rows[0];
};