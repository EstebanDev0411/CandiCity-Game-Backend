import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { userCollection } from "../config/collections";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const deleteUser: RequestHandler = (req: any, res: any) => {
  logger.info("delete user");
  const userId = req.query.userId;
  FirestoreService.deleteOne(userCollection, userId)
    .then((_response) => {
      return res
        .status(StatusCodes.OK)
        .json({ status: "successfully deleted" });
    })
    .catch((error: any) => {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    });
};

export const updateUser: RequestHandler = (req: any, res: any) => {
  logger.info("update user");
  const userId = req.query.userId;
  FirestoreService.updateOne(userCollection, userId, req.body)
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

export const getOnlineUsers: RequestHandler = async (_req: any, res: any) => {
  logger.info("get online users");
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

export const getUser: RequestHandler = async (req: any, res: any) => {
  logger.info("get user");
  const userId = req.query.userId;
  try
  {
    const ret = (await db.collection(userCollection).doc(userId).get()).data();
    return res.status(StatusCodes.OK).json(ret);
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};


const user = { deleteUser, updateUser, getOnlineUsers, getUser};
export default user;
