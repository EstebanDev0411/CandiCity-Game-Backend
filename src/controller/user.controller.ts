import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { powerupCollection, userCollection } from "../config/collections";
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

export const postScore: RequestHandler = async (req: any, res: any) => {
  logger.info("post Score");
  const userId = req.query.userId;
  try
  {
    const ret = (await db.collection(userCollection).doc(userId).get()).data();
    const { score } = req.body;
    await db.collection(userCollection).doc(userId).update({"point" : ret?.point + parseInt(score), "level": (ret?.point + parseInt(score)) / 100})
      .then((_response) => {
        updateRanks();
        return res
          .status(StatusCodes.OK)
          .json({ status: "successfully updated" });
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

export const getPowerupItem: RequestHandler = async (req: any, res: any) => {
  logger.info("Get powerup Item");
  const { userId } = req.query;  
  try {
    const { item } = req.body;
    const querySnapshot = await db.collection(powerupCollection).where('name', '==', item).get();
    if (querySnapshot.empty) {
      throw new Error(`Powerup item with name ${item} not found`);
    }
    const powerupItemId = querySnapshot.docs[0].id;
    const powerupItemRef = db.collection('users').doc(userId).collection('powerupItems').doc(powerupItemId);
    await powerupItemRef.set(item);
    return res.status(StatusCodes.OK).json({ status: "successfully got Item" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const user = { deleteUser, updateUser, postScore, getUser, getPowerupItem};
export default user;
