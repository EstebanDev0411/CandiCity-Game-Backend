import { Router } from "express";
import match from "../controller/match.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const matchRoute = Router();

// matchRoute.post("/create", verifyBodyRequest, match.addMatch);
matchRoute.post("/createMatch", verifyBodyRequest, match.createMatch);
matchRoute.post("/startMatch", verifyBodyRequest, match.startMatch);
matchRoute.post("/finishMatch", verifyBodyRequest, match.finishMatch);
matchRoute.get("/getMatchesByUserId", match.getMatchesByUserId);

export default matchRoute;
