import { Router } from "express";
import user from "../controller/user.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const userRoute = Router();

userRoute.post("/update", verifyBodyRequest, user.updateUser);
userRoute.delete("/delete", user.deleteUser);

export default userRoute;
