import { Router } from "express";
import authRoutes from "./auth";
import eventRoutes from "./event";
// Combines all the routes into one large route file
const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/events", eventRoutes);
export default rootRouter;
