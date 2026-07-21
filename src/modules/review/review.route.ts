import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { reviewController } from "./review.controller.js";

const router = Router();

router.post("/", auth(Role.CUSTOMER), reviewController.createReview);
router.get("/", auth(Role.CUSTOMER), reviewController.getCustomerReviews);

export const reviewRoutes = router;
