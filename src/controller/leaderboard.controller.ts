import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import FirestoreService from "../service/firestore.service";
import { userCollection, leaderboardCollection } from "../config/collections";

export const getLeaderboard : RequestHandler = async (_req: any, res: any) => {
  logger.info("get current leaderboard");
  try
  {
    const filter = {
      field: "is_online",
      opStr: "==",
      value: true,
    };
    const ret = await FirestoreService.fetchData(userCollection, filter);
    
    return res.status(StatusCodes.OK).json(ret);
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};