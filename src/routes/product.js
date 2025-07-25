const express = require("express");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const model = require("../models");

const router = express.Router();

let authenticateToken = async (req, res, next) => {
  try {
    let header = req.headers.authorization;
    let token = header.split(" ")[1];
    const result = jwt.verify(token, "secret");
    if (result) {
      req.user = result;
      next();
    } else {
      res.json({ message: "token is invalid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "token expired" });
  }
};

router.get("", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const sql = `select category.category_name,products.id,products.name,products.description,products.price,products.stock
                     from category inner join products on category.id=products.category_id`;
    const categories = await connection.query(sql);

    // console.log(categories)
    // let sameCategoryOfProduct = {};
    // if (sameCategoryOfProduct) {
    //   for (let i = 0; i < categories[0].length; i++) {
    //     if (!sameCategoryOfProduct[categories[0][i].category_name]) {
    //       sameCategoryOfProduct[categories[0][i].category_name] = [];
    //     }
    //     sameCategoryOfProduct[categories[0][i].category_name].push(
    //       categories[0][i]
    //     );
    //   }
    //   return res.json({ availableproducts: sameCategoryOfProduct });
    // } else {
    //   return res.json({ message: "No category found" });
    // }
    return res.json(categories[0]);
  } catch (error) {
    console.log("connected");
    res.json({ message: "error occured" });
  }
});

router.get("/:name", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const { name } = req.params;
    let sql = `select category.category_name,products.id,products.name,products.description,products.price,products.stock
                   from category inner join products on category.id=products.category_id where category_name='${name}' `;
    let result = await connection.query(sql);
    if (result[0].length > 0) {
      return res.json({ category: result[0] });
    } else {
      return res.json({ message: `No item found in ${name}` });
    }
  } catch (error) {
    res.json({ message: "error occured" });
  }
});

router.get("/:name/:product", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const { name, product } = req.params;
    let sql = `select category.category_name,products.id,products.name,products.description,products.price,products.stock
                   from category inner join products on category.id=products.category_id 
                   where category_name='${name}' and products.name="${product}"`;
    let result = await connection.query(sql);
    if (result[0].length > 0) {
      return res.json({ category: result[0] });
    } else {
      return res.json({ message: `No product found in ${product}` });
    }
  } catch (error) {
    res.json({ message: "error occured" });
  }
});

router.post("", authenticateToken, async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      const { name, description, price, stock, categoryid } = req.body;
      const time = moment().format("YYYY-MM-DD HH:mm:ss:SSSS");
      let sql = `insert into products (name,description,price,stock,category_id,created_at,updated_at)
                 values("${name}","${description}","${price}","${stock}","${categoryid}","${time}","${time}")`;
      await connection.query(sql);
      res.json({ message: "product successfully added" });
    } else {
      res.json({ Message: "only admin can post the product" });
    }
  } catch (error) {
    console.log(error);
    res.json({ Message: "error occured" });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const a = req.params.id;
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      const { name, description, price, stock, categoryid } = req.body;
      let sql = `update products set name="${name}",description="${description}",price="${price}",stock="${stock}",category_id="${categoryid}" 
            where id=${a}`;
      await connection.query(sql);
      res.json({ message: "product updated" });
    } else {
      res.json({ message: "only admin can update the product" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error occured" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const a = req.params.id;
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      let sql = `delete from products where id=${a}`;
      await connection.query(sql);
      res.json({ message: "product deleted" });
    } else {
      res.json({ message: "only admin can delete the product" });
    }
  } catch (error) {
    console.log("connected");
    res.json({ message: "error occured" });
  }
});

module.exports = router;
