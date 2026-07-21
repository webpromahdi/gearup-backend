import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { rentalOrderController } from "./rentalOrder.controller.js";

// ---------- Customer routes ----------
const customerRouter = Router();
customerRouter.post(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.createRentalOrder,
);
customerRouter.get(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.getCustomerRentalOrders,
);
customerRouter.get(
  "/:id",
  auth(Role.CUSTOMER),
  rentalOrderController.getCustomerRentalOrderById,
);
customerRouter.patch(
  "/:id",
  auth(Role.CUSTOMER),
  rentalOrderController.cancelRentalOrder,
);
export const rentalCustomerRoutes = customerRouter;

// ---------- Provider routes ----------
const providerRouter = Router();
providerRouter.get(
  "/",
  auth(Role.PROVIDER),
  rentalOrderController.getProviderOrders,
);
providerRouter.get(
  "/:id",
  auth(Role.PROVIDER),
  rentalOrderController.getProviderOrderById,
);
providerRouter.patch(
  "/:id",
  auth(Role.PROVIDER),
  rentalOrderController.updateOrderStatus,
);
export const rentalProviderRoutes = providerRouter;
