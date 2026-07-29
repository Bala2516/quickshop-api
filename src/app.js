import express from "express";
import cors from "cors";

import user from "./routes/user.route.js";
import product from "./routes/product.route.js";
import category from "./routes/category.route.js";
import order from "./routes/order.route.js";
import cart from "./routes/cart.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", user);
app.use("/api/product", product);
app.use("/api/order", order);
app.use("/api/category", category);
app.use("/api/cart", cart);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "E-Commerce API is running",
  });
});

export default app;
