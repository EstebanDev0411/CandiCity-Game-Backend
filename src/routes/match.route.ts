import { Router } from "express";
import match from "../controller/match.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const matchRoute = Router();

matchRoute.post("/create", verifyBodyRequest, match.addMatch);
matchRoute.post("/update", verifyBodyRequest, match.updateMatch);
matchRoute.get("/getAvailableMatches", match.getAvailableMatches);
matchRoute.get("/getMatchesByUserId", match.getMatchesByUserId);
export default matchRoute;
