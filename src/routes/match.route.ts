import { Router } from "express";
import match from "../controller/match.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const matchRoute = Router();

// matchRoute.post("/create", verifyBodyRequest, match.addMatch);
matchRoute.post("/joinMatch", verifyBodyRequest, match.joinMatch);
matchRoute.post("/startMatch", match.startMatch);
matchRoute.post("/finishMatch", match.finishMatch);
matchRoute.post("/getMatchesByUserId", match.getMatchesByUserId);

export default matchRoute;
