const express=require("express")
const bodyParser=require("body-parser")
const app=express()
const user=require("./routes/users.js")
const product=require("./routes/product.js")
const category=require("./routes/category.js")
const order=require("./routes/orders.js")
const cart=require("./routes/cart.js")
const cors=require("cors")

app.use(bodyParser.json())

app.use(cors())
app.use(user)
app.use("/products",product)
app.use("/categories",category)
app.use("/order",order)
app.use("/cart",cart)

module.exports=app