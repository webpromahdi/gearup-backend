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
