import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalOrderController } from "./rentalOrder.controller";

const customerRouter = Router();
customerRouter.post(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.createRentalOrder,
);
export const rentalCustomerRoutes = customerRouter;

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
