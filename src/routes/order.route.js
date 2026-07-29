import express from "express";
import {
  orderPost,
  orderGetAll,
  orderGet,
  orderGetById,
  orderUpdate,
  orderDelete,
} from "../controllers/order.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/order-post", authenticateToken, orderPost);

router.get("/order-get-all", authenticateToken, orderGetAll);
router.get("/order-get", authenticateToken, orderGet);
router.get("/order-get/:id", orderGetById);

router.put("/order-update/:id", orderUpdate);

router.delete("/order-delete/:id", orderDelete);

export default router;
