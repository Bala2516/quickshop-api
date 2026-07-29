import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getProductByCategoryAndName,
  productPost,
  productUpdateById,
  productDeleteById,
} from "../controllers/product.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/product", getAllProducts);
router.get("/product/:categoryName", getProductsByCategory);
router.get("/product/:categoryName/:productName", getProductByCategoryAndName);

router.post("/product-post", authenticateToken, productPost);

router.put("/product-update/:id", authenticateToken, productUpdateById);

router.delete("/product-delete/:id", authenticateToken, productDeleteById);

export default router;
