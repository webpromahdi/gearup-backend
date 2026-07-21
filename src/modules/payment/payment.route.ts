import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post("/webhook", paymentController.handleStripeWebhook);

router.post(
  "/create",
  auth(Role.CUSTOMER),
  paymentController.createCheckoutSession,
);

router.get("/", auth(Role.CUSTOMER), paymentController.getCustomerPayments);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  paymentController.getCustomerPaymentById,
);

export const paymentRoutes = router;
