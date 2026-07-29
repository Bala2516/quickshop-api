import express from "express";
import {
  cartGet,
  cartGetById,
  cartPost,
  cartUpdate,
  cartDelete,
} from "../controllers/cart.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cart-post", authenticateToken, cartPost);

router.get("/cart-get", authenticateToken, cartGet);
router.get("/cart-get/:id", cartGetById);

router.put("/cart-update/:id", cartUpdate);

router.delete("/cart-delete/:id", cartDelete);

export default router;
