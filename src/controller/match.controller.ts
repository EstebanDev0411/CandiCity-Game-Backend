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
    // Add the user's data to the current leaderboard
    const currentLeaderboardRef = db.collection(leaderboardCollection).doc('currentLeaderboard');
    const currentLeaderboardDoc = await currentLeaderboardRef.get();
    const currentUsers = currentLeaderboardDoc.data()?.users || [];
    const currentUserIndex = currentUsers.findIndex((user:any) => user.user === user_id);
    if (currentUserIndex === -1) {
      // User doesn't exist in the current leaderboard, so add a new entry
      currentUsers.push({ user: user_id, winCount: 1 });
    } else {
      // User already exists in the current leaderboard, so update its winCount
      currentUsers[currentUserIndex].winCount += 1;
    }
    await currentLeaderboardRef.update({ users: currentUsers });

    return res.status(StatusCodes.OK).json({ message: 'Win count updated successfully' });
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const match = { createMatch, startMatch, finishMatch, getMatchesByUserId, postWin };
export default match;