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
    const sql = `select * from category`;
    const categories = await connection.query(sql);
    res.json({ categories: categories[0] });
  } catch (error) {
    console.error(error);
    res.json({ message: "Error categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    const a = req.params.id;
    const sql = `select * from category where id=${a}`;
    const categories = await connection.query(sql);
    res.json({ categories: categories[0] });
  } catch (error) {
    console.error(error);
    res.json({ message: "Error updating category" });
  }
});

router.post("", authenticateToken, async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      const { name } = req.body;
      const time = moment().format("YYYY-MM-DD HH:mm:ss:SSSS");
      const sql = `insert into category (category_name,created_at) values('${name}','${time}')`;
      await connection.query(sql);
      res.json({ message: "category successfully added" });
    } else {
      res.json({ Message: "only admin can post the category" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Error category" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    const a = req.params.id;
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      const { name } = req.body;
      const time = moment().format("YYYY-MM-DD HH:mm:ss:SSSS");
      let sql = `update category set category_name='${name}',created_at='${time}' where id='${a}'`;
      await connection.query(sql);
      res.json({ message: "category updated successfully" });
    } else {
      res.json({ Message: "only admin can update the category" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Error updating category" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    const a = req.params.id;
    const userId = req.user.id;
    let sql0 = `select * from userdetails where id=${userId}`;
    let result = await connection.query(sql0);
    if (result[0][0].is_admin == 1) {
      let sql = `delete from category where id=${a}`;
      await connection.query(sql);
      res.json({ message: "category deleted" });
    } else {
      res.json({ Message: "only admin can delete the category" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Error deleting category" });
  }
});

module.exports = router;
