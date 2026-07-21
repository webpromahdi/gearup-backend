import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { categoryRoutes } from "../modules/category/category.route.js";
import {
  gearPublicRoutes,
  gearProviderRoutes,
} from "../modules/gearItem/gearItem.route.js";
import {
  rentalCustomerRoutes,
  rentalProviderRoutes,
} from "../modules/rentalOrder/rentalOrder.route.js";
import { paymentRoutes } from "../modules/payment/payment.route.js";
import { reviewRoutes } from "../modules/review/review.route.js";
import { adminRoutes } from "../modules/admin/admin.route.js";

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
  { path: "/admin", route: adminRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
