import { Router } from "express";
import { verifyBodyRequest } from "../middlewares/verifyRequest";
import auth from "../controller/auth.controller";

const authRoute = Router();

authRoute.post("/signup", verifyBodyRequest, auth.signup);
authRoute.post("/signin", verifyBodyRequest, auth.signin);
authRoute.post("/forget-password", verifyBodyRequest, auth.forgetPassword);

export default authRoute;
