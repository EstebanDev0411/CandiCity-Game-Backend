import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const createOne = async (collectionName: string, data: any) => {
  try {
    var docsRef = db.collection(collectionName);
    return await docsRef.add(data);
  } catch (e) {
    throw e;
  }
};

export const updateOne = async (
  collectionName: string,
  docId: string,
  updatedData: any
) => {
  try {
    var docsRef = db.collection(collectionName);
    return await docsRef.doc(docId).set(updatedData, { merge: true });
  } catch (e) {
    throw e;
  }
};

export const fetchOne = async (collectionName: string, filter: any) => {
  try {
    var docsRef = db.collection(collectionName);
    return await docsRef.where(filter.field, filter.opStr, filter.value).get();
  } catch (e) {
    throw e;
  }
};

const FirestoreService = { createOne, updateOne, fetchOne };
export default FirestoreService;