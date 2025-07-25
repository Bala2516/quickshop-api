const express = require('express')
const moment = require("moment")
const model = require("../models")
const jwt=require("jsonwebtoken")

const router = express.Router()

let authenticateToken = async (req, res, next) => {
    try {
        let header = req.headers.authorization
        let token = header.split(" ")[1]
        const result = jwt.verify(token, "secret")
        console.log(result)
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

router.get("/",authenticateToken,async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const userId = req.user.id
        let sql=`select id,product_id,category,product,quantity,price from cart where user_id='${userId}'`
        let result=await connection.query(sql)
        res.json({cart:result[0]})
    } catch (error) {
        console.log(error)
        res.json({message:"error occured"})
    }
})

router.get("/:id",async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a=req.params.id
        let sql=`select id,product_id,category,product,quantity,price from cart where id=${a}`
        let result=await connection.query(sql)
        if(result[0].length>0){
            return res.json({cart:result[0]})
        }
        res.json({message:'product not found'})
    } catch (error) {
        console.log(error)
        res.json({message:"error occured"})
    }
})

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
        let sql1=`insert into cart (user_id,product_id,quantity,price,created_at,updated_at,product,category)
        values('${userId}','${product_id}','${quantity}','${price}','${orderDate}','${orderDate}','${name}','${categoryName}')`
        await connection.query(sql1)
        res.json({message:"product added"})
    } catch (error) {
        console.log(error)
        res.json({message:"product id is not found"})
    }
})

router.put("/:id",authenticateToken,async (req,res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a=req.params.id
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
        let sql1=`update cart set user_id="${userId}",product_id="${product_id}"
        ,quantity="${quantity}",price="${price}",created_at="${orderDate}",updated_at="${orderDate}",product="${name}",category="${categoryName}" where id=${a}`
        await connection.query(sql1)
        res.json({cart:"cart updated"})
    } catch (error) {
        console.log(error)
        res.json({message:"error occured"})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const connection = await model.mysql.createConnection(model.db)
        const a = req.params.id
        let sql = `delete from cart where id=${a}`
        await connection.query(sql)
        res.json({ message: "cart item deleted" })
    } catch (error) {
        console.error(error)
        res.json({ message: 'Error deleting category' })
    }
})

module.exports=router