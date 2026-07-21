import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import {
  gearPublicRoutes,
  gearProviderRoutes,
} from "../modules/gearItem/gearItem.route";
import {
  rentalCustomerRoutes,
  rentalProviderRoutes,
} from "../modules/rentalOrder/rentalOrder.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { reviewRoutes } from "../modules/review/review.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/gear", route: gearPublicRoutes },
  { path: "/provider/gear", route: gearProviderRoutes },
  { path: "/rentals", route: rentalCustomerRoutes },
  { path: "/provider/orders", route: rentalProviderRoutes },
  { path: "/payments", route: paymentRoutes },
  { path: "/reviews", route: reviewRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
