import { pool } from "../config/db.js";
import { isAdmin } from "../lib/admin.service.js";

export const getAllProducts = async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      c.category_name
    FROM products p
    LEFT JOIN category c
      ON p.category_id = c.id
  `);

  return res.status(200).json({
    products: rows,
  });
};

export const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  const [rows] = await pool.execute(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      c.category_name
    FROM products p
    JOIN category c
      ON p.category_id = c.id
    WHERE c.category_name = ?
    `,
    [categoryName],
  );

  return res.status(200).json({
    products: rows,
  });
};

export const getProductByCategoryAndName = async (req, res) => {
  const { categoryName, productName } = req.params;
  const [rows] = await pool.execute(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      c.category_name
    FROM products p
    JOIN category c
      ON p.category_id = c.id
    WHERE c.category_name = ?
      AND p.name = ?
    `,
    [categoryName, productName],
  );

  return res.status(200).json({ product: rows });
};

export const productPost = async (req, res) => {
  try {
    const userId = req.user.id;

    const admin = await isAdmin(userId);

    if (!admin) {
      return res.status(403).json({
        message: "Only admins can add products",
      });
    }

    const { name, description, price, stock, category_id } = req.body;

    const [result] = await pool.execute(
      `
      INSERT INTO products(
        name,
        description,
        price,
        stock,
        category_id
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, description, price, stock, category_id],
    );

    return res.status(201).json({
      message: "Product created",
      productId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const productUpdateById = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!(await isAdmin(userId))) {
      return res.status(403).json({
        message: "Only admins can update products",
      });
    }

    const { id } = req.params;

    const { name, description, price, stock, category_id } = req.body;

    const [result] = await pool.execute(
      `
      UPDATE products
      SET
        name = ?,
        description = ?,
        price = ?,
        stock = ?,
        category_id = ?
      WHERE id = ?
      `,
      [name, description, price, stock, category_id, id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const productDeleteById = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!(await isAdmin(userId))) {
      return res.status(403).json({
        message: "Only admins can delete products",
      });
    }

    const { id } = req.params;

    const [result] = await pool.execute(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// export const productPost = async (req, res) => {
//   try {
//     const connection = await model.mysql.createConnection(model.db);
//     console.log("connected");
//     const userId = req.user.id;
//     let sql0 = `select * from userdetails where id=${userId}`;
//     let result = await connection.query(sql0);
//     if (result[0][0].is_admin == 1) {
//       const { name, description, price, stock, categoryid } = req.body;
//       const time = moment().format("YYYY-MM-DD HH:mm:ss:SSSS");
//       let sql = `insert into products (name,description,price,stock,category_id,created_at,updated_at)
//                  values("${name}","${description}","${price}","${stock}","${categoryid}","${time}","${time}")`;
//       await connection.query(sql);
//       res.json({ message: "product successfully added" });
//     } else {
//       res.json({ Message: "only admin can post the product" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ Message: "error occured" });
//   }
// };

// export const productUpdatebyId = async (req, res) => {
//   try {
//     const connection = await model.mysql.createConnection(model.db);
//     console.log("connected");
//     const a = req.params.id;
//     const userId = req.user.id;
//     let sql0 = `select * from userdetails where id=${userId}`;
//     let result = await connection.query(sql0);
//     if (result[0][0].is_admin == 1) {
//       const { name, description, price, stock, categoryid } = req.body;
//       let sql = `update products set name="${name}",description="${description}",price="${price}",stock="${stock}",category_id="${categoryid}"
//             where id=${a}`;
//       await connection.query(sql);
//       res.json({ message: "product updated" });
//     } else {
//       res.json({ message: "only admin can update the product" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ message: "error occured" });
//   }
// };

// export const productDeleteById = async (req, res) => {
//   try {
//     const connection = await model.mysql.createConnection(model.db);
//     console.log("connected");
//     const a = req.params.id;
//     const userId = req.user.id;
//     let sql0 = `select * from userdetails where id=${userId}`;
//     let result = await connection.query(sql0);
//     if (result[0][0].is_admin == 1) {
//       let sql = `delete from products where id=${a}`;
//       await connection.query(sql);
//       res.json({ message: "product deleted" });
//     } else {
//       res.json({ message: "only admin can delete the product" });
//     }
//   } catch (error) {
//     console.log("connected");
//     res.json({ message: "error occured" });
//   }
// };
