import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/categories", route: categoryRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;