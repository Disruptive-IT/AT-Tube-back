import { Router } from "express";
import userRoutes from "./user.routes.js";


const routes = Router();

routes.use("/admin", userRoutes);

export default routes;
