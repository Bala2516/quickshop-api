import { pool } from "../config/db.js";
import { getProductDetails } from "../lib/product.service.js";

export const cartGet = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT
        c.id,
        c.product_id,
        p.name,
        cat.category_name,
        c.quantity,
        p.price,
        (c.quantity * p.price) AS total_price
      FROM cart c
      JOIN products p
        ON c.product_id = p.id
      JOIN category cat
        ON p.category_id = cat.id
      WHERE c.user_id = ?
      `,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

export const cartGetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM cart
      WHERE id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch cart item",
    });
  }
};

export const cartPost = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    const product = await getProductDetails(product_id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await pool.execute(
      `
      INSERT INTO cart(
        user_id,
        product_id,
        quantity
      )
      VALUES (?, ?, ?)
      `,
      [userId, product_id, quantity]
    );

    res.status(201).json({
      message: "Product added to cart",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add product",
    });
  }
};

export const cartUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const [result] = await pool.execute(
      `
      UPDATE cart
      SET quantity = ?
      WHERE id = ?
      `,
      [quantity, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update cart",
    });
  }
};

export const cartDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      `
      DELETE FROM cart
      WHERE id = ?
      `,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete cart item",
    });
  }
};