import { Router } from "express";
import powerup from "../controller/powerup.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const matchRoute = Router();

matchRoute.post("/addItem", verifyBodyRequest, powerup.addItem);
matchRoute.delete("/deleteItem", verifyBodyRequest, powerup.deleteItem);
matchRoute.get("/getAllItems", powerup.getAllItems);

export default matchRoute;
