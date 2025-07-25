const express = require("express");
const moment = require("moment");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");

const model = require("../models");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const { username, mobileno, address, emailId, is_admin } = req.body;
    console.log(req.body);
    const uid = uuid.v4();
    const timeAndDate = moment().format("YYYY-MM-DD HH:mm:ss:SSSS");
    if (username.length <= 0) {
      return res.json({ message: "username required" });
    }
    if (mobileno.length != 10) {
      return res.json({ message: "check mobileno length" });
    }
    let result = [];
    for (let i = 0; i < mobileno.length; i++) {
      if (mobileno[i] > "9" || mobileno[i] < "0") {
        result += mobileno[i];
      }
    }
    if (result.length > 0) {
      return res.json({ message: "Invalid mobileno" });
    }
    function validateGmail(emailId) {
      const gmailRegex =
        /^[a-z][a-zA-Z0-9._-]{1,}[a-zA-Z0-9]@(gmail\.com|yahoo\.com|gmail\.org|yahoo\.org)$/;
      return gmailRegex.test(emailId);
    }
    if (!validateGmail(emailId)) {
      return res.json({ message: "Invalid emailid" });
    }
    if (is_admin == 1 || is_admin == 0) {
      let sql = `insert into userDetails (userid,username,mobileno,address,emailId,is_admin,created_at)
                values('${uid}','${username}','${mobileno}','${address}','${emailId}',"${+is_admin}",'${timeAndDate}')`;
      let result1 = await connection.query(sql);
      let id = result1[0].insertId;
      if (is_admin == true) {
        let sql1 = `insert into admin (user_id,username,mobileno,emailId) values("${id}","${username}","${mobileno}","${emailId}")`;
        await connection.query(sql1);
      }
      let sql1 = `insert into register (id,mobileno) values("${id}","${mobileno}")`;
      await connection.query(sql1);
      let sql2 = `insert into authenticate(id,userId)
                values("${id}","${uid}")`;
      await connection.query(sql2);
      res.json({ message: "Successfully registered" });
    } else {
      res.json({
        message: "only boolean value accepted in the field is_admin",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "Duplicate entry found" });
  }
});

router.post("/otp", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const { mobileno } = req.body;
    console.log(mobileno);
    let sql = `select * from register where mobileno=${mobileno}`;
    let result = await connection.query(sql);
    console.log(result);
    if (mobileno.length != 10) {
      return res.json({ message: "check the mobileno" });
    }
    if (result[0].length > 0 && result[0][0].mobileno == mobileno) {
      const otp = Math.floor(Math.random() * 900000 + 100000);
      let duriation = moment().add(3, "minutes");
      let expireTime = moment(duriation).format("YYYY-MM-DD HH:mm:ss");
      let sql1 = `update register set otp="${otp}" , expire_otp="${expireTime}" where mobileno=${mobileno}`;
      await connection.query(sql1);
      return res.json({ OTP: otp });
    } else {
      res.json({ message: "mobileno is not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error occured" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const { mobileno, otp } = req.body;
    console.log(mobileno, "00000000");
    console.log(otp);
    let sql = `select * from register inner join authenticate 
                   on register.id=authenticate.id where mobileno="${mobileno}"`;
    let result = await connection.query(sql);
    let userId = result[0][0].id;
    const tokens = jwt.sign({ id: userId }, "secret");
    // const tokens = jwt.sign({ id: userId }, "secret", { expiresIn: "2h" });
    const date = moment().format("YYYY-MM-DD HH:mm:ss.SSSSS");
    let sql1 = `update authenticate set token="${tokens}",created_at="${date}",updated_at="${date}" where id="${userId}"`;
    await connection.query(sql1);
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    if (result[0][0].otp == otp && result[0][0].expire_otp > currentTime) {
      return res.json({ token: tokens });
    } else if (
      result[0][0].otp == otp &&
      result[0][0].expire_otp < currentTime
    ) {
      return res.json({ message: "OTP EXPIRED" });
    } else {
      res.json({ message: "login unsuccessful" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error occcured" });
  }
});

let authenticateToken = async (req, res, next) => {
  try {
    let header = req.headers.authorization;
    console.log(header, "token");
    let token = header.split(" ")[1];
    const result = jwt.verify(token, "secret");
    console.log(result);
    if (result) {
      req.user = result;
      next();
    } else {
      res.json({ message: "token is invalid" });
    }
  } catch (error) {
    res.json({ message: "token expired" });
  }
};

router.get("/userdetails", authenticateToken, async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const userid = req.user.id;
    let sql = `SELECT userdetails.id,userdetails.username,userdetails.mobileno,userdetails.address,userdetails.emailId
                 FROM userdetails where id="${userid}"`;
    let result = await connection.query(sql);
    let sql0 = `SELECT * FROM userdetails where id="${userid}"`;
    let results = await connection.query(sql0);
    console.log(results);
    let admin = results[0][0].is_admin == 0 ? false : true;
    let sql1 = `SELECT orders.id,orders.product_id,orders.quantity,orders.price,orders.status,orders.product,orders.category 
                  FROM userdetails inner join orders on  userdetails.id=orders.user_id where userdetails.id="${userid}"`;
    let result1 = await connection.query(sql1);
    let sql2 = `SELECT cart.id,cart.product_id,cart.quantity,cart.price,cart.product,cart.category FROM userdetails
                inner join cart on  userdetails.id=cart.user_id where userdetails.id="${userid}"
                `;
    let result2 = await connection.query(sql2);
    if (result[0].length > 0) {
      //   return res.json({
      //     user: result[0][0],
      //     is_admin: admin,
      //   });
      // } else if (result1[0].length > 0) {
      //   return res.json({
      //     user: result[0][0],
      //     is_admin: admin,
      //     orders: result1[0],
      //   });
      // } else if (result1[0].length > 0 && result2[0].length > 0) {
      return res.json({
        user: result[0][0],
        is_admin: admin,
        orders: result1[0],
        cart: result2[0],
      });
    } else {
      return res.json({ user: "No user found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error occured" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const a = req.params.id;
    const { username, mobileno, address, emailId, is_admin } = req.body;
    if (mobileno.length != 10) {
      return res.json({ message: "check the mobileno length" });
    }
    let sql = `update userDetails set username="${username}",mobileno="${mobileno}",address="${address}",emailId="${emailId}",is_admin="${is_admin}"
        where id=${a}`;
    await connection.query(sql);
    let sql1 = `update register set mobileno="${mobileno}" where id=${a}`;
    await connection.query(sql1);
    res.statusCode(200).json({ message: "user updated" });
  } catch (error) {
    console.log(error);
    res.json({ message: "error occured" });
  }
});

router.delete("/deleteuser/:id", async (req, res) => {
  try {
    const connection = await model.mysql.createConnection(model.db);
    console.log("connected");
    const a = req.params.id;
    let tables = ["authenticate", "register", "admin"];
    for (let i = 0; i < tables.length; i++) {
      let sql = `delete from ${tables[i]} where id=${a}`;
      await connection.query(sql);
    }
    let table1 = ["orders", "cart", "admin"];
    for (let i = 0; i < table1.length; i++) {
      let sql = `delete from ${table1[i]} where user_id=${a}`;
      await connection.query(sql);
    }
    let sql = `delete from userdetails where id=${a}`;
    await connection.query(sql);
    res.json({ message: "user deleted" });
  } catch (error) {
    console.log(error);
    res.json({ message: "error occured" });
  }
});

module.exports = router;
