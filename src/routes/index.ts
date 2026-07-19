import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import { gearPublicRoutes, gearProviderRoutes } from "../modules/gearItem/gearItem.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/gear", route: gearPublicRoutes },
  { path: "/provider/gear", route: gearProviderRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;