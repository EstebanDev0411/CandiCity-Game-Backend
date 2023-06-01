import { RequestHandler } from "express";
import { matchCollection } from "../config/collections";
import logger from "../utils/logger";
import { StatusCodes } from "http-status-codes";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const joinMatch: RequestHandler = async (req: any, res: any) => {
    logger.info('create new match room');
    if (!req.body.user1_id) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          user1_id: 'user1_id is required'
        });
    }
    try {
        const { user1_id, user2_id } = req.body;
        const newDoc = {
            user1 : user1_id,
            user2 : user2_id,
            play_status: 1,
            winner: "",
            created_at: Date(),
            started_at: Date(),
            finished_at: Date()
        };
        const ret = await FirestoreService.createOne(matchCollection, newDoc);
        return res.status(StatusCodes.CREATED).json(ret);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const startMatch: RequestHandler = async (req: any, res: any) => {
    logger.info("update match");
    const matchId = req.query.match_id;
    try
    {
      await db.collection(matchCollection).doc(matchId).update(
          { 
            "play_status": 2,
            "started_at": Date()
          })
        .then((_response) => {
          return res
            .status(StatusCodes.OK)
            .json({ status: "successfully started" });
        })
        .catch((error: any) => {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
        });
    } catch(error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const finishMatch: RequestHandler = async (req: any, res: any) => {
  logger.info("update match");
  const matchId = req.query.match_id;
  try
  {
    const { winner } = req.body;
    await db.collection(matchCollection).doc(matchId).update(
        {
          "play_status": 3,
          "winner" : winner,
          "finished_at": Date(),
        })
      .then((_response) => {
        return res
          .status(StatusCodes.OK)
          .json({ status: "successfully finished" });
      })
      .catch((error: any) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      });
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const getMatchesByUserId: RequestHandler = async (req: any, res: any) => {
  logger.info("get matches by userId ");
  const { user_id } = req.body;
  try
  {
    console.log(user_id)
    const ret = db.collection(matchCollection).where('user1', '==', user_id).where('play_status', '==', 1).get();
    return res.status(StatusCodes.OK).json(ret);  
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const match = { joinMatch, startMatch, finishMatch, getMatchesByUserId };
export default match;