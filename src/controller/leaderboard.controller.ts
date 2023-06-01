import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import FirestoreService from "../service/firestore.service";
import { userCollection, matchCollection } from "../config/collections";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
export const getOnlineUsers: RequestHandler = async (_req: any, res: any) => {
  logger.info("get online users");
  try
  {
    const filter = {
      field: "is_online",
      opStr: "==",
      value: true,
    };
    updateRanks();
    const ret = await FirestoreService.fetchData(userCollection, filter);
    return res.status(StatusCodes.OK).json(ret);
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const getAvailableMatches: RequestHandler = async (_req: any, res: any) => {
  logger.info("get available matches");
  try
  {
    const filter = {
      field: "play_status",
      opStr: "==",
      value: 1,
    };
    const ret = await FirestoreService.fetchData(matchCollection, filter);
    return res.status(StatusCodes.OK).json(ret);
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const getMatchHistory: RequestHandler = async (_req: any, res: any) => {
  logger.info("get available matches");
  try
  {
    const filter = {
      field: "play_status",
      opStr: "==",
      value: 3,
    };
    const ret = await FirestoreService.fetchData(matchCollection, filter);
    return res.status(StatusCodes.OK).json(ret);
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

// Define a function to sort users by points and update their rank
async function updateRanks(): Promise<void> {
  // Get all the users from Firestore
  const users = db.collection(userCollection);
  // Query the collection to get all documents sorted by points
  users.orderBy("point", "desc").get()
  .then((querySnapshot) => {
    let rank = 1;
    querySnapshot.forEach((doc) => {
      doc.ref.update({
        rank: rank,
      })
      .then(() => {
        console.log(`Document ${doc.id} updated successfully`);
      })
      .catch((error) => {
        console.error(`Error updating document ${doc.id}:`, error);
      });

      rank ++;
    });
  })
  .catch((error) => {
    console.error('Error querying collection:', error);
  })
}

const leaderboard = { getOnlineUsers, getAvailableMatches, getMatchHistory };
export default leaderboard;