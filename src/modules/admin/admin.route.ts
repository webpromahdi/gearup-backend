import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { adminController } from "./admin.controller.js";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);
router.get("/gear", auth(Role.ADMIN), adminController.getAllGearListings);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentalOrders);

export const adminRoutes = router;
