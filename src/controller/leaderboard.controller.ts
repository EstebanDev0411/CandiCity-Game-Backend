import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import FirestoreService from "../service/firestore.service";
import { userCollection, matchCollection, leaderboardCollection } from "../config/collections";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
export const getOnlineUsers: RequestHandler = async (req: any, res: any) => {
  logger.info("get online users");
  try
  {
    // const { count, page } = req.body;
    // const filter = {
    //   field: "is_online",
    //   opStr: "==",
    //   value: true,
    // };
    const { count, page } = req.query;
    const startAfter = count * (page - 1);

    updateRanks();
    // const ret = await FirestoreService.fetchData(userCollection, filter);  
    const ret = await db.collection(userCollection).orderBy('rank').limit(count).startAfter(startAfter).get();
    const ret_data: FirebaseFirestore.DocumentData[] = ret.docs.map(
      (doc) => {
        return { ...doc.data(), id: doc.id };
      }   
    );
    return res.status(StatusCodes.OK).json(ret_data);
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


// Define a function to update the daily leaderboard
async function updateDailyLeaderboards() {
  console.log('update daily leaderboards!')
  const usersRef = db.collection(userCollection);
  const leaderboardRef = db.collection(leaderboardCollection);

  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  // const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

  // Get the top 3 daily users and update the daily top 3 collection
  const yesterdayQuery = await usersRef.where('lastPlayed', '>=', yesterday).get();
  const yesterdayUsers = yesterdayQuery.docs.map(doc => ({ id: doc.id, name: doc.data().userName, dailyScore: doc.data().dailyScore, reward: true }));
  // Sort the users by daily score and get the top 3
  const top3Users = yesterdayUsers
    .filter(user => user.dailyScore > 0) // Exclude users with a daily score of 0
    .sort((a, b) => b.dailyScore - a.dailyScore)
    .slice(0, 3);
  console.log(top3Users)
  await leaderboardRef.doc("dailyReward").set({users: top3Users});
}

// Define a function to update the weekly leaderboard
async function updateWeeklyLeaderboards() {
  console.log('update weekly leaderboards!')
  const usersRef = db.collection(userCollection);
  const leaderboardRef = db.collection(leaderboardCollection);

  const today = new Date();
  // const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);

  // Get the top 3 weekly users and update the weekly top 3 collection
  const weeklyQuery = await usersRef.where('lastPlayed', '>=', lastWeekStart).get();
  const weeklyUsers = weeklyQuery.docs.map(doc => ({ id: doc.id, name: doc.data().userName, weeklyScore: doc.data().weeklyScore, reward: true }));
  const top3WeeklyUsers = weeklyUsers
    .filter(user => user.weeklyScore > 0) // Exclude users with a weekly score of 0
    .sort((a, b) => b.weeklyScore - a.weeklyScore)
    .slice(0, 3);
  console.log(top3WeeklyUsers)
  await leaderboardRef.doc("weeklyReward").set({users: top3WeeklyUsers});
}

// Call the updateLeaderboards function once a day at midnight
setInterval(() => {
  const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateDailyLeaderboards();
        // resetScores();
    }
    if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0)
    {
      updateWeeklyLeaderboards();
    }
  }, 60000);

const leaderboard = { getOnlineUsers, getAvailableMatches, getMatchHistory };
export default leaderboard;