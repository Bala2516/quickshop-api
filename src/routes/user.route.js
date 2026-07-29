import express from "express";
import {
  signUp,
  otp,
  login,
  userDetails,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/otp", otp);
router.post("/login", login);

router.get("/userdetails", authenticateToken, userDetails);

router.put("/update-user/:id", authenticateToken, updateUser);

router.delete("/delete-user/:id", authenticateToken, deleteUser);

export default router;
