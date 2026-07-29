import {pool} from "../config/db.js"
import { isAdmin } from "../lib/admin.service.js";


export const orderPost = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    const [products] = await pool.execute(
      `
      SELECT price
      FROM products
      WHERE id = ?
      `,
      [product_id]
    );

    if (!products.length) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const totalPrice = products[0].price * quantity;

    const [result] = await pool.execute(
      `
      INSERT INTO orders(
        user_id,
        product_id,
        quantity,
        price
      )
      VALUES (?, ?, ?, ?)
      `,
      [userId, product_id, quantity, totalPrice]
    );

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const orderGetAll = async (req, res) => {
  try {
    const admin = await isAdmin(req.user.id);

    if (!admin) {
      return res.status(403).json({
        message: "Only admins can access all orders",
      });
    }

    const [orders] = await pool.execute(
      `
      SELECT *
      FROM orders
      ORDER BY order_date DESC
      `
    );

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const orderGet = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.execute(
      `
      SELECT
        o.id,
        p.name,
        o.quantity,
        o.price,
        o.status,
        o.order_date
      FROM orders o
      JOIN products p
        ON o.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
      `,
      [userId]
    );

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const orderGetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.execute(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      `,
      [id]
    );

    if (!orders.length) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      order: orders[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const orderUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, quantity } = req.body;

    const [products] = await pool.execute(
      `
      SELECT price
      FROM products
      WHERE id = ?
      `,
      [product_id]
    );

    if (!products.length) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const totalPrice = products[0].price * quantity;

    const [result] = await pool.execute(
      `
      UPDATE orders
      SET
        product_id = ?,
        quantity = ?,
        price = ?
      WHERE id = ?
      `,
      [product_id, quantity, totalPrice, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const orderDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      `
      DELETE FROM orders
      WHERE id = ?
      `,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

