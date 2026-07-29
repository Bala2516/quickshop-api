import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { generateOtp, getOtpExpiry } from "../lib/otp.js";
import { generateToken } from "../lib/utils.js";

export const signUp = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { username, mobileno, address, email, is_admin } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    if (!/^\d{10}$/.test(mobileno)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    await connection.beginTransaction();

    const uuid = uuidv4();

    const [userResult] = await connection.execute(
      `
      INSERT INTO users
      (uuid, username, mobileno, address, email, is_admin)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [uuid, username, mobileno, address, email, is_admin],
    );

    const userId = userResult.insertId;

    await connection.execute(
      `
      INSERT INTO register(user_id, mobileno)
      VALUES (?, ?)
      `,
      [userId, mobileno],
    );

    await connection.execute(
      `
      INSERT INTO authenticate(user_id)
      VALUES (?)
      `,
      [userId],
    );

    if (is_admin) {
      await connection.execute(
        `
        INSERT INTO admin(user_id)
        VALUES (?)
        `,
        [userId],
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error(error);

    return res.status(500).json({
      message: "Registration failed",
    });
  } finally {
    connection.release();
  }
};

export const otp = async (req, res) => {
  try {
    const { mobileno } = req.body;

    if (!/^\d{10}$/.test(mobileno)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT * FROM register
      WHERE mobileno = ?
      `,
      [mobileno],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Mobile number not found",
      });
    }

    const otp = generateOtp();
    const expiry = getOtpExpiry();

    await pool.execute(
      `
      UPDATE register
      SET otp = ?, expire_otp = ?
      WHERE mobileno = ?
      `,
      [otp, expiry, mobileno],
    );

    return res.status(200).json({
      otp,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { mobileno, otp } = req.body;

    if (!/^\d{10}$/.test(mobileno)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT r.*, a.user_id
      FROM register r
      JOIN authenticate a
      ON r.user_id = a.user_id
      WHERE r.mobileno = ?
      `,
      [mobileno],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Mobile number not found",
      });
    }

    const user = rows[0];

    // OTP Validation
    if (String(user.otp) !== String(otp)) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    // Expiry Validation
    if (moment().isAfter(moment(user.expire_otp))) {
      return res.status(401).json({
        message: "OTP Expired",
      });
    }

    const token = generateToken(user.user_id);

    await pool.execute(
      `
      UPDATE authenticate
      SET token = ?
      WHERE user_id = ?
      `,
      [token, user.user_id],
    );

    return res.status(200).json({
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // User Details
    const [users] = await pool.execute(
      `
      SELECT
        id,
        uuid,
        username,
        mobileno,
        address,
        email,
        is_admin,
        created_at
      FROM users
      WHERE id = ?
      `,
      [userId],
    );

    if (!users.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // Orders
    const [orders] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        quantity,
        price,
        status,
        order_date
      FROM orders
      WHERE user_id = ?
      `,
      [userId],
    );

    // Cart
    const [cart] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        quantity,
        created_at
      FROM cart
      WHERE user_id = ?
      `,
      [userId],
    );

    return res.status(200).json({
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        mobileno: user.mobileno,
        address: user.address,
        email: user.email,
      },
      is_admin: Boolean(user.is_admin),
      orders,
      cart,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, mobileno, address, email, is_admin } = req.body;

    // Validation
    if (!/^\d{10}$/.test(mobileno)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.execute(
        `
        UPDATE users
        SET
          username = ?,
          mobileno = ?,
          address = ?,
          email = ?,
          is_admin = ?
        WHERE id = ?
        `,
        [username, mobileno, address, email, is_admin, id],
      );

      if (!userResult.affectedRows) {
        await connection.rollback();

        return res.status(404).json({
          message: "User not found",
        });
      }

      await connection.execute(
        `
        UPDATE register
        SET mobileno = ?
        WHERE user_id = ?
        `,
        [mobileno, id],
      );

      if (is_admin) {
        await connection.execute(
          `
          INSERT IGNORE INTO admin (user_id)
          VALUES (?)
          `,
          [id],
        );
      } else {
        await connection.execute(
          `
          DELETE FROM admin
          WHERE user_id = ?
          `,
          [id],
        );
      }

      await connection.commit();

      return res.status(200).json({
        message: "User updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};