import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { userCollection } from "../config/collections";
import { getFirestore } from "firebase-admin/firestore";

import * as admin from "firebase-admin";
import FirestoreService from "../service/firestore.service";

const db = getFirestore();

export const deleteUser: RequestHandler = (req: any, res: any) => {
  logger.info("delete user");
  const userId = req.query.userId;
  admin
    .auth()
    .deleteUser(userId)
    .then(async function () {
      await db.collection(userCollection).doc(userId).delete();
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
  FirestoreService.updateOne(userCollection, req.query.userId, req.body)
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
