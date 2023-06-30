import { RequestHandler } from "express";
import { leaderboardCollection, matchCollection } from "../config/collections";
import logger from "../utils/logger";
import { StatusCodes } from "http-status-codes";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const createMatch: RequestHandler = async (req: any, res: any) => {
    logger.info('create new match room');
    const {userId} = req.query;
    try {
        const newDoc = {
            user1 : userId,
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
    const { userId, matchId } = req.query;
    try
    {
      await db.collection(matchCollection).doc(matchId).update(
          { 
            "user2" : userId,
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
    const ret = db.collection(matchCollection).where('user1', '==', user_id).get();
    return res.status(StatusCodes.OK).json(ret);  
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const postWin: RequestHandler = async (req: any, res: any) => {
  logger.info("Post Win");
  const user_id = req.query.userId;
  try {
    const docRef = await db.collection(leaderboardCollection).where('user', '==', user_id).get();
    if (docRef.empty) {
      // No document exists with user1 equal to user_id, so create a new document with winCount as 1
      await db.collection(leaderboardCollection).add({ user: user_id, winCount: 1 });
      return res.status(StatusCodes.OK).json({ message: 'New document created with winCount as 1' });
    } else {
      // A document exists with user1 equal to user_id, so update its winCount
      const doc = docRef.docs[0];
      const currentWinCount = doc.get('winCount');
      await doc.ref.update({ winCount: currentWinCount + 1 });
      return res.status(StatusCodes.OK).json({ message: 'Win count updated successfully' });
    }
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const match = { createMatch, startMatch, finishMatch, getMatchesByUserId, postWin };
export default match;