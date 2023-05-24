import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { userCollection } from "../config/collections";
import FirestoreService from "../service/firestore.service";

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

const user = { deleteUser, updateUser };
export default user;
