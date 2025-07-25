const express = require('express')
const moment = require("moment")
const model = require("../models")
const jwt = require("jsonwebtoken") 

const router = express.Router();

let authenticateToken = async (req, res, next) => {
    try {
        let header = req.headers.authorization
        let token = header.split(" ")[1]
        const result = jwt.verify(token, "secret")
        if (result) {
            req.user = result
            next()
        }
        else {
            res.json({ message: "token is invalid" })
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "token expired" })
    }
}

router.post("/",authenticateToken,async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const{product_id,quantity}=req.body
        const userId = req.user.id
        const orderDate=moment().format("YYYY-MM-DD HH:mm:ss")
        let sql=`select products.name,products.price,category.category_name from category 
                 inner join products on category.id=products.category_id where products.id=${product_id}`
        let result=await connection.query(sql)
        let name=result[0][0].name
        let amount=result[0][0].price
        let price=amount*quantity
        let categoryName=result[0][0].category_name
        let sql1=`insert into orders (user_id,product_id,quantity,price,order_date,product,category)
        values('${userId}','${product_id}','${quantity}','${price}','${orderDate}','${name}','${categoryName}')`
        await connection.query(sql1)
        res.json({message:"order placed"})
    } catch (error) {
        console.log(error)
        res.json({message:"product id is not found"})
    }
})

router.get("/all",authenticateToken,async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const userId = req.user.id
        let sql0 = `select * from userdetails where id=${userId}`
        let result = await connection.query(sql0)
        if (result[0][0].is_admin == 1) {
            const sql = `select * from orders`
            let result=await connection.query(sql)
            res.json({ message: result[0] })
        }
        else {
            res.json({ Message: "only admin can access" })
        }
    } catch (error) {
        console.error(error)
        res.json({ message: 'Error category' })
    }
})

router.get("/",authenticateToken,async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const userId = req.user.id
        let sql=`select id,category,product,quantity,price,status,order_date from orders where user_id='${userId}'`
        let result=await connection.query(sql)
        res.json({orders:result[0]})
    } catch (error) {
        // console.log(error)
        res.json({message:"error occured"})
    }
})

router.get("/:id",async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a=req.params.id
        let sql=`select * from orders where id=${a}`
        let result=await connection.query(sql)
        if(result[0].length>0){
            return res.json({orders:result[0]})
        }
        res.json({message:'No order found'})
    } catch (error) {
        console.log(error)
        res.json({message:"error occured"})
    }
})

router.put("/:id",async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a=req.params.id
        const{user_id,product_id,quantity}=req.body
        const orderDate=moment().format("YYYY-MM-DD HH:mm:ss")
        let sql=`select products.name,products.price,category.category_name from category 
                 inner join products on category.id=products.category_id where products.id=${product_id}`
        let result=await connection.query(sql)
        let name=result[0][0].name
        let amount=result[0][0].price
        let price=amount*quantity
        let categoryName=result[0][0].category_name
        let sql1=`update orders set user_id="${user_id}",product_id="${product_id}"
        ,quantity="${quantity}",price="${price}",order_date="${orderDate}",product="${name}",category="${categoryName}" where id=${a}`
        await connection.query(sql1)
        res.json({order:"order updated"})
    } catch (error) {
        console.log(error)
        res.json({message:"error occured"})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a = req.params.id
        let sql = `delete from orders where id=${a}`
        await connection.query(sql)
        res.json({ message: " order deleted" })
    } catch (error) {
        console.error(error)
        res.json({ message: 'Error deleting category' })
    }
})

module.exports=router