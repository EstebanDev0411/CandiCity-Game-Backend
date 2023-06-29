import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { userCollection } from "../config/collections";
import FirestoreService from "../service/firestore.service";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from 'firebase-admin';

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
    const ret = (await db.collection(userCollection).where('userName', '==', userId).get()).docs[0].data();
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
    const ret = (await db.collection(userCollection).where('userName', '==', userId).get()).docs[0].data();
    const { level } = req.body;
    const originLevel = ret?.level;

    if(level > originLevel)
    {
      (await db.collection(userCollection).where('userName', '==', userId).get()).docs[0].ref.update({"level" : level})
      .then((_response) => {
        // updateRanks();
        return res
          .status(StatusCodes.OK)
          .json({ status: "successfully updated" });
      })
      .catch((error: any) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      });
    }
    else
    {
      return res
      .status(StatusCodes.OK)
      .json({ status: "already set level" });
    }
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

// // Define a function to sort users by points and update their rank
// async function updateRanks(): Promise<void> {
//   // Get all the users from Firestore
//   const users = db.collection(userCollection);
//   // Query the collection to get all documents sorted by points
//   users.orderBy("level", "desc").get()
//   .then((querySnapshot) => {
//     let rank = 1;
//     querySnapshot.forEach((doc) => {
//       doc.ref.update({
//         rank: rank,
//       })
//       .then(() => {
//         console.log(`Document ${doc.id} updated successfully`);
//       })
//       .catch((error) => {
//         console.error(`Error updating document ${doc.id}:`, error);
//       });

//       rank ++;
//     });
//   })
//   .catch((error) => {
//     console.error('Error querying collection:', error);
//   })
// }

// export const getPowerupItem: RequestHandler = async (req: any, res: any) => {
//   logger.info("Get powerup Item");
//   const { userId } = req.query;  
//   try {
//     const { item } = req.body;
//     const querySnapshot = await db.collection(powerupCollection).where('name', '==', item).get();
//     if (querySnapshot.empty) {
//       throw new Error(`Powerup item with name ${item} not found`);
//     }
//     const powerupItemId = querySnapshot.docs[0].id;
//     const powerupItemRef = (await db.collection('users').where('userName', '==', userId).get()).docs[0].doc(powerupItemId);
//     await powerupItemRef.set(item);
//     return res.status(StatusCodes.OK).json({ status: "successfully got Item" });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

export const addBalance: RequestHandler = async (req: any, res: any) => {
  logger.info("Add balance");
  try {
    const userId = req.query.userId;
    const { amount } = req.body;
    // Get the current token value
    const userDoc = await db.collection(userCollection).where('userName', '==', userId).get();
    const currentTokenValue = userDoc.docs[0].data().token;

    // Calculate the new token value
    const newTokenValue = currentTokenValue + parseInt(amount);

    // Check if the new token value is less than 0
    if (newTokenValue < 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Need more balance. Token value cannot be less than 0" });
    }
    await (await db.collection(userCollection).where('userName', '==', userId).get()).docs[0].ref.update({token : admin.firestore.FieldValue.increment(parseInt(amount))})
    .then((_response) => {
      return res
        .status(StatusCodes.OK)
        .json({ status: "successfully added" });
    })
    .catch((error: any) => {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    });
  } catch(error)
  {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
}


const user = { deleteUser, updateUser, postScore, getUser, addBalance};
export default user;
