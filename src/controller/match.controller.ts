import { RequestHandler } from "express";
import { matchCollection } from "../config/collections";
import logger from "../utils/logger";
import { StatusCodes } from "http-status-codes";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const addMatch: RequestHandler = async (req: any, res: any) => {
    logger.info('create new room');
    if (!req.body.user1_id) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          user1_id: 'user1_id is required',
        });
    }
    try {
        const { user1_id } = req.body;
        const newDoc = {
            user1_id : user1_id,
            play_status: 0,
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

export const updateMatch: RequestHandler = async (req: any, res: any) => {
    logger.info("update match");
    const matchId = req.query.match_id;
    FirestoreService.updateOne(matchCollection, matchId, req.body)
      .then((_response) => {
        return res
          .status(StatusCodes.OK)
          .json({ status: "successfully updated" });
      })
      .catch((error: any) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      });
};

export const getAvailableMatches: RequestHandler = async (req: any, res: any) => {
    logger.info("get available matches");
    const { match_status } = req.body;
    console.log(match_status)
    try
    {
      const filter = {
        field: "play_status",
        opStr: "==",
        value: match_status,
      };
      const ret = await FirestoreService.fetchData(matchCollection, filter);
      return res.status(StatusCodes.OK).json(ret);
    } catch(error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };

  export const getMatchesByUserId: RequestHandler = async (req: any, res: any) => {
    logger.info("get matches by userId ");
    const { match_status, user_id } = req.body;
    try
    {
      const ret = db.collection(matchCollection).where('play_status', '==', match_status).where('user1_id', '==', user_id).get();
      return res.status(StatusCodes.OK).json(ret);
    } catch(error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };

const match = { addMatch, updateMatch, getAvailableMatches, getMatchesByUserId };
export default match;