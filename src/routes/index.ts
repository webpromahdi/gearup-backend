import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;