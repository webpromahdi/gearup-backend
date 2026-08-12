import { Router } from "express";
import { authController } from "./auth.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import passport from "passport";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  authController.getMyProfile,
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }),
);
router.get("/google/callback", authController.googleLoginCallback);

export const authRoutes = router;
