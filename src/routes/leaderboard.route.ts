import { Router } from "express";
import leaderboard from "../controller/leaderboard.controller";
import { verifyBodyRequest } from "../middlewares/verifyRequest";

const leaderboardRoute = Router();

// matchRoute.post("/create", verifyBodyRequest, match.addMatch);
leaderboardRoute.get("/getLeaderboard", leaderboard.getLeaderboard);
leaderboardRoute.get("/getAwardLeaderboard", leaderboard.getAwardLeaderboard);
leaderboardRoute.get("/getAvailableMatches", leaderboard.getAvailableMatches);
leaderboardRoute.get("/getMatchHistory", leaderboard.getMatchHistory);
leaderboardRoute.post('/getDailyAward', verifyBodyRequest, leaderboard.getDailyAward);

export default leaderboardRoute;
