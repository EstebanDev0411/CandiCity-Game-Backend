import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import firebase from "../config/firebase";
import FirestoreService from "../service/firestore.service";
import { userCollection } from "../config/collections";

// // Sign in with Google
// export const signInWithGoogle = async (req: Request, res: Response): Promise<Response> => {
//   logger.info('signInWithGoogle');

//   try {
//     const { idToken } = req.body;

//     // Sign in with Firebase Authentication.
//     firebase
//       .auth()
//       .signInWithCredential(firebase.auth.GoogleAuthProvider.credential(idToken))
//       .then((data) => {
//         // Handle successful sign-in.
//         return res.status(StatusCodes.OK).json({ message: 'Successfully signed in with Google!' });
//       })
//       .catch((error) => {
//         // Handle sign-in error.
//         let errorCode = error.code;
//         let errorMessage = error.message;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
//       });
//   } catch (error) {
//     // Handle error.
//   }
// };

// // Sign in with Facebook
// export const signInWithFacebook = async (req: Request, res: Response): Promise<Response> => {
//   logger.info('signInWithFacebook');

//   try {
//     const { accessToken } = req.body;

//     // Sign in with Firebase Authentication.
//     firebase
//       .auth()
//       .signInWithCredential(firebase.auth.FacebookAuthProvider.credential(accessToken))
//       .then(async (_data) => {
//         // Handle successful sign-in.
//         const filter = {
//           field: "email",
//           opStr: "==",
//           value: req.body.email,
//         };
//         const doc = (await FirestoreService.fetchOne(userCollection, filter))
//           .docs[0];
//         const retVal = {
//           uid: doc.id,
//           ...doc.data(),
//         };
//         return res.status(StatusCodes.OK).json(retVal);
//       })
//       .catch((error) => {
//         // Handle sign-in error.
//         let errorMessage = error.message;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
//       });
//   } catch (error) {
//     // Handle error.
//   }
// };

// signup
export const signup: RequestHandler = (req: any, res: any) => {
  logger.info("signup");
  if (!req.body.email || !req.body.password || !req.body.userName || req.body.userName == "") {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      email: "email is required",
      password: "password is required",
      userName: "user name is required",
    });
  }
  firebase
    .auth()
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then(async (_data: any) => {
      const newDoc = {
        email: req.body.email,
        points: 1000,
        rank: 1000,
        is_online: true,
        userName: req.body.userName
      };
      const ret = await FirestoreService.createOne(userCollection, newDoc);
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

// signin
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
    .then(async (_user) => {
      const filter = {
        field: "email",
        opStr: "==",
        value: req.body.email,
      };
      const doc = (await FirestoreService.fetchOne(userCollection, filter))
        .docs[0];
      const retVal = {
        uid: doc.id,
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


const user = { signup, signin, verifyEmail, forgetPassword };
export default user;
