import { RequestHandler } from "express";
import { matchCollection } from "../config/collections";
import logger from "../utils/logger";
import { StatusCodes } from "http-status-codes";
import FirestoreService from "../service/firestore.service";

export const addMatch: RequestHandler = async (req: any, res: any) => {
    logger.info('new match');
    if (!req.body.user1_id || !req.body.user2_id) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          user1_id: 'user1_id is required',
          user2_id: 'user2_id is required',
        });
    }
    try {
        const { user1_id, user2_id } = req.body;
        const newDoc = {
            user1 : user1_id,
            user2 : user2_id,
            create_at: Date(),
            update_at: Date()
        };
        const ret = await FirestoreService.createOne(matchCollection, newDoc);
        return res.status(StatusCodes.CREATED).json(ret);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

const match = { addMatch };
export default match;