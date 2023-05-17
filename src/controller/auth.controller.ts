import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import firebase from "../config/firebase";
import FirestoreService from "../service/firestore.service";
import {
  userCollection,
} from "../config/collections";
import { getFirestore } from "firebase-admin/firestore";
// import { getRandomArbitrary } from "../utils/utils";
const db = getFirestore();

// signup
export const signup: RequestHandler = async (req: any, res: any) => {
  logger.info("signup");
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.userName ||
    req.body.userName === ""
  ) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      email: "email is required",
      password: "password is required",
      userName: "username is required",
    });
  }

  // check userName is duplicated
  const filter = {
    field: "userName",
    opStr: "==",
    value: req.body.userName,
  };

  const userDocs = (await FirestoreService.fetchOne(userCollection, filter))
    .docs;
  if (userDocs.length > 0) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      userName: "username is duplicated",
    });
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then(async (data: any) => {
      const newDoc = {
        email: req.body.email,
        userName: req.body.userName,
        point: 1000,
        rank: 1000,
        level: 1
      };
      const ret = await db
        .collection(userCollection)
        .doc(data.user?.uid)
        .create(newDoc);
      return res.status(StatusCodes.CREATED).json(ret);
    })
    .catch(function (error: any) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode == "auth/weak-password") {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      } else {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      }
    });
};

export const signin: RequestHandler = (req: any, res: any) => {
  logger.info("signin");
  if (!req.body.email || !req.body.password) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      email: "email is required",
      password: "password is required",
    });
  }
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(async (user) => {
      const filter = {
        field: "email",
        opStr: "==",
        value: req.body.email,
      };
      const doc = (await FirestoreService.fetchOne(userCollection, filter))
        .docs[0];
      const retVal = {
        userId: user.user?.uid,
        ...doc.data(),
      };
      return res.status(StatusCodes.OK).json(retVal);
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode === "auth/wrong-password") {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      } else {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      }
    });
};

// verify email
// this work after signup & signin
export const verifyEmail: RequestHandler = (_req: any, res: any) => {
  logger.info("verify-email");
  firebase
    .auth()
    .currentUser?.sendEmailVerification()
    .then(function () {
      return res
        .status(StatusCodes.OK)
        .json({ status: "Email Verification Sent!" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode === "auth/too-many-requests") {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      }
    });
};

// forget password
export const forgetPassword: RequestHandler = (req: any, res: any) => {
  logger.info("forget-password");
  if (!req.body.email) {
    return res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ email: "email is required" });
  }
  firebase
    .auth()
    .sendPasswordResetEmail(req.body.email)
    .then(function () {
      return res
        .status(StatusCodes.OK)
        .json({ status: "Password Reset Email Sent" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode == "auth/invalid-email") {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      } else if (errorCode == "auth/user-not-found") {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: errorMessage });
      }
    });
};

const auth = { signup, signin, verifyEmail, forgetPassword };
export default auth;
