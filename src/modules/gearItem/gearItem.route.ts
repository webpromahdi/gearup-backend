import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { gearItemController } from "./gearItem.controller";


const gearPublicRouter = Router();
export const gearPublicRoutes = gearPublicRouter;


const providerRouter = Router();
providerRouter.post("/", auth(Role.PROVIDER), gearItemController.createGearItem);
providerRouter.get("/", auth(Role.PROVIDER), gearItemController.getProviderGear);
providerRouter.put("/:id", auth(Role.PROVIDER), gearItemController.updateGearItem);
providerRouter.delete("/:id", auth(Role.PROVIDER), gearItemController.deleteGearItem);
export const gearProviderRoutes = providerRouter;
