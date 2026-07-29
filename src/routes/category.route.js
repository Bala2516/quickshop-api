import express from "express";
import {
  categoryGet,
  categoryGetById,
  categoryPost,
  categoryUpdate,
  categoryDelete,
} from "../controllers/category.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/category", categoryGet);
router.get("/category/:id", categoryGetById);

router.post("/category-post", authenticateToken, categoryPost);

router.put("/category-update/:id", authenticateToken, categoryUpdate);

router.delete("/category-delete/:id", authenticateToken, categoryDelete);

export default router;
