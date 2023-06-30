import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import FirestoreService from "../service/firestore.service";
import { matchCollection, leaderboardCollection } from "../config/collections";
import { getFirestore } from "firebase-admin/firestore";
import { ethers } from "ethers"; 

import { candyTokenABI } from "../utils/candyTokenAbi"

const adminPrivateKey = 'fbee3586ad39698b8b5639e60b90d926cd23ffe16887766ae804ea0cbb592eaa';
// Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider("https://evm.cronos.org");
const signer = new ethers.Wallet(adminPrivateKey, provider);

// Set up Candy Token contract
// const adminAddress = '0x0e8F349464e19749B7F3b86f4f0593F15E5cC53a';
const candyTokenAddress = "0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977";
const candyTokenContract = new ethers.Contract(candyTokenAddress, candyTokenABI, signer);

const db = getFirestore();

interface AwardUser {
  reward: boolean;
  user: string;
  id: string;
  dailyScore: number;
}

export const getLeaderboard: RequestHandler = async (req: any, res: any) => {
  logger.info("get leaderboard");
  try {
    const { count, page, userId } = req.query;
    const startAfter = count * (page - 1);
    const endBefore = startAfter + count;
    
    // Retrieve the users array data from the currentLeaderboard document
    const querySnapshot = await db.collection(leaderboardCollection).doc('currentLeaderboard').get();
    const leaderboardData = querySnapshot.data()?.users || [];
    // Sort the users array in descending order by winCount and add a rank property to each item
    leaderboardData.sort((a: { winCount: number; }, b: { winCount: number; }) => b.winCount - a.winCount);
    leaderboardData.forEach((user: { rank: any; }, index: number) => user.rank = index + 1);
    const myRank = leaderboardData.find((data: { user: any; }) => data.user === userId);
    // Paginate the leaderboard data based on the count and page query parameters
    const paginationData = leaderboardData.slice(startAfter, endBefore);

    return res.status(StatusCodes.OK).json({myRank, paginationData});
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};


export const getAwardLeaderboard: RequestHandler = async (req: any, res: any) => {
  logger.info("get award leaderboard");
  try {
    const { count, page, userId } = req.query;
    const startAfter = count * (page - 1);
    const endBefore = startAfter + count;
    
    // Retrieve the users array data from the currentLeaderboard document
    const querySnapshot = await db.collection(leaderboardCollection).doc('rewardLeaderboard').get();
    const leaderboardData = querySnapshot.data()?.users || [];
    // Sort the users array in descending order by winCount and add a rank property to each item
    leaderboardData.sort((a: { winCount: number; }, b: { winCount: number; }) => b.winCount - a.winCount);
    leaderboardData.forEach((user: { rank: any; }, index: number) => user.rank = index + 1);
    const myRank = leaderboardData.find((data: { user: any; }) => data.user === userId);
    // Paginate the leaderboard data based on the count and page query parameters
    const paginationData = leaderboardData.slice(startAfter, endBefore);

    return res.status(StatusCodes.OK).json({myRank, paginationData});
  } catch(error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
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
// async function updateRanks(): Promise<void> {
//   // Get all the users from Firestore
//   const users = db.collection(userCollection);
//   // Query the collection to get all documents sorted by points
//   users.orderBy("point", "desc").get()
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

// Give Award
export const getDailyAward: RequestHandler = async (req, res) => {
  logger.info("Get Award");
  const { userId } = req.query; 
  try {
    const { rewardAmount, walletAddress } = req.body;
    // Example usage
    const value = ethers.utils.parseUnits(rewardAmount, 18); // Transfer 100 Candy Tokens
    const receipt = await transferCandyToken(walletAddress, value);
    if (receipt.status === 1) {
      // Update database with successful transaction
      const rewardUsers = (await db.collection(leaderboardCollection).doc("rewardLeaderboard").get()).data();
      const updatedUsers = rewardUsers?.users.map((user : AwardUser) => {
        if (user.user === userId) {
          return { ...user, reward: false };
        } else {
          return user;
        }
      });
      await db.collection(leaderboardCollection).doc("rewardLeaderboard").set({users: updatedUsers});
      return res.status(200).json({ message: 'Award sent successfully' });
    } else {
      return res.status(500).json({ message: 'Transaction failed' });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

// Set up transfer function
export async function transferCandyToken(to: string, value: ethers.BigNumberish) {
  const tx = await candyTokenContract.transfer(to, value);
  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed.");
  return receipt;
}

// // Define a function to update the daily leaderboard
async function updateLeaderboard() {
  console.log('update daily leaderboards!')
  const leaderboardRef = db.collection(leaderboardCollection);

  // Get the top 10 users by win count from the current leaderboard
  const querySnapshot = await leaderboardRef.doc('currentLeaderboard').get();
  const currentLeaderboardData = querySnapshot.data();
  const top10Users = currentLeaderboardData?.users
    .filter((user: { winCount: number; }) => user.winCount > 0) // Exclude users with a win count of 0
    .sort((a: { winCount: number; }, b: { winCount: number; }) => b.winCount - a.winCount)
    .slice(0, 10)
    .map((user: { winCount: number; }) => {
      return {
        ...user,
        reward: false // Add a reward property to each user object
      };
    });

  // Copy the top 10 users to the reward leaderboard
  await leaderboardRef.doc('rewardLeaderboard').set({ users: top10Users });

  // Reset the current leaderboard as empty data
  await leaderboardRef.doc('currentLeaderboard').set({ users: [] });
}

// // Define a function to update the weekly leaderboard
// async function updateWeeklyLeaderboards() {
//   console.log('update weekly leaderboards!')
//   const usersRef = db.collection(userCollection);
//   const leaderboardRef = db.collection(leaderboardCollection);

//   const today = new Date();
//   // const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
//   const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);

//   // Get the top 3 weekly users and update the weekly top 3 collection
//   const weeklyQuery = await usersRef.where('lastPlayed', '>=', lastWeekStart).get();
//   const weeklyUsers = weeklyQuery.docs.map(doc => ({ id: doc.id, name: doc.data().userName, weeklyScore: doc.data().weeklyScore, reward: true }));
//   const top3WeeklyUsers = weeklyUsers
//     .filter(user => user.weeklyScore > 0) // Exclude users with a weekly score of 0
//     .sort((a, b) => b.weeklyScore - a.weeklyScore);
//   console.log(top3WeeklyUsers)
//   await leaderboardRef.doc("weeklyBoard").set({users: top3WeeklyUsers});
// }

// async function updateMonthlyLeaderboards() {
//   console.log('Updating monthly leaderboards!');
//   const leaderboardRef = db.collection(leaderboardCollection);
//   const monthlyRanking = leaderboardRef.doc('monthlyRanking');
//   const monthlyReward = leaderboardRef.doc('monthlyReward');

//   // Get the current top users in the monthly ranking
//   const leaderboardDoc = await monthlyRanking.get();
//   const currentTopUsers = leaderboardDoc.exists ? leaderboardDoc.data()?.topUsers ?? [] : [];
//   // Sort the top users by score in descending order
//   const sortedTopUsers = currentTopUsers.sort((a: { score: number; }, b: { score: number; }) => b.score - a.score);

//   // Extract the top 3 users and their scores
//   const top3Users = sortedTopUsers.slice(0, 3).map((user: { score: any; userId: any; }, index: number) => ({ score: user.score, rank: index + 1, name: user.userId, award: true}));

//   // Store the top 3 users in the monthly reward document
//   await monthlyReward.set({ topUsers: top3Users });

//   // Clear the data in the monthly ranking document
//   await monthlyRanking.set({ topUsers: [] });
// }

// // Call the updateLeaderboards function once a day at midnight
setInterval(() => {
  const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateLeaderboard();
        // resetScores();
    }
    // if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0)
    // {
    //   updateWeeklyLeaderboards();
    // }
    // if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
    //   updateMonthlyLeaderboards();
    // }
  }, 60000);

const leaderboard = { getLeaderboard, getAwardLeaderboard, getAvailableMatches, getMatchHistory };
export default leaderboard;