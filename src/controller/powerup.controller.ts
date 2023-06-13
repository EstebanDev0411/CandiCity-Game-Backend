import { RequestHandler } from "express";
import { leaderboardCollection, powerupCollection } from "../config/collections";
import logger from "../utils/logger";
import { StatusCodes } from "http-status-codes";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const addItem: RequestHandler = async (req: any, res: any) => {
    logger.info('add new powerup item');

    const existingItem = await FirestoreService.getOneByField(powerupCollection, "name", req.body.name);
    if (existingItem) {
      return res.status(StatusCodes.CONFLICT).json({
        name: "item name already exists",
      });
    }
    try {
        const { name, description } = req.body;
        const newDoc = {
            name : name,
            description : description
        };
        const ret = await FirestoreService.createOne(leaderboardCollection, newDoc);
        return res.status(StatusCodes.CREATED).json(ret);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const deleteItem: RequestHandler = async (req: any, res: any) => {
  logger.info("update match");
  const name = req.query.name;
  try
  {
    const querySnapshot = await db.collection(powerupCollection).where('name', '==', name).get();
    // Delete the item if it exists
    if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        await docSnapshot.ref.delete();
        console.log(`${name} Item deleted successfully`);
    } else {
        console.log(`No documents with ${name} Item found`);
    }
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const getAllItems: RequestHandler = async (_req: any, res: any) => {
  logger.info("get all items");
  try
  {
    const ret = db.collection(powerupCollection).get();
    return res.status(StatusCodes.OK).json(ret);  
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const match = { addItem, deleteItem, getAllItems };
export default match;