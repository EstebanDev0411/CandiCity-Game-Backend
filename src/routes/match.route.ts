import { Router } from "express";
import match from "../controller/match.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const matchRoute = Router();

matchRoute.post("/create", verifyBodyRequest, match.addMatch);

export default matchRoute;
