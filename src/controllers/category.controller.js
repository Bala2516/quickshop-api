import { pool } from "../config/db.js";
import { isAdmin } from "../lib/admin.service.js";


export const categoryGet = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `
      SELECT *
      FROM category
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      categories,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const categoryGetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      `
      SELECT *
      FROM category
      WHERE id = ?
      `,
      [id]
    );

    if (!categories.length) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      category: categories[0],
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const categoryPost = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!(await isAdmin(userId))) {
      return res.status(403).json({
        message: "Only admins can create categories",
      });
    }

    const { name } = req.body;

    const [result] = await pool.execute(
      `
      INSERT INTO category(category_name)
      VALUES (?)
      `,
      [name]
    );

    return res.status(201).json({
      message: "Category created",
      categoryId: result.insertId,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const categoryUpdate = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!(await isAdmin(userId))) {
      return res.status(403).json({
        message: "Only admins can update categories",
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    const [result] = await pool.execute(
      `
      UPDATE category
      SET category_name = ?
      WHERE id = ?
      `,
      [name, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const categoryDelete = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!(await isAdmin(userId))) {
      return res.status(403).json({
        message: "Only admins can delete categories",
      });
    }

    const { id } = req.params;

    const [result] = await pool.execute(
      `
      DELETE FROM category
      WHERE id = ?
      `,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
