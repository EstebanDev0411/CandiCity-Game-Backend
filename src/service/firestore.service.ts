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

export const deleteOne = async (
  collectionName: string,
  docId: string
) => {
  try {
    var docsRef = db.collection(collectionName);
    return await docsRef.doc(docId).delete();
  } catch (e) {
    throw e;
  }
}

export const fetchOne = async (collectionName: string, filter: any) => {
  try {
    var docsRef = db.collection(collectionName);
    return await docsRef.where(filter.field, filter.opStr, filter.value).get();
  } catch (e) {
    throw e;
  }
};

export const fetchData = async (collectionName: string, filter: any) => {
  try {
    var docsRef = db.collection(collectionName);
    const ret = await docsRef.where(filter.field, filter.opStr, filter.value)
      .get();
    const ret_data: FirebaseFirestore.DocumentData[] = ret.docs.map(
      (doc) => {
        return { ...doc.data(), id: doc.id };
      }   
    );
    return ret_data;
  } catch (e) {
    throw e;
  }
};

export const fetchAll = async (collectionName: string) => {
  try {
    var docsRef = db.collection(collectionName);
    const ret = await docsRef.get();
    const ret_data: FirebaseFirestore.DocumentData[] = ret.docs.map(
      (doc) => {
        return { ...doc.data(), id: doc.id };
      }
    );
    return ret_data;
  } catch (e) {
    throw e;
  }
};

const getOneByField = async (collectionName: string, fieldName: string, value: any) => {
  const collectionRef = db.collection(collectionName);
  const querySnapshot = await collectionRef.where(fieldName, "==", value).get();
  if (querySnapshot.empty) {
    return null;
  } else {
    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();
    return { id: docSnapshot.id, ...data };
  }
};

const FirestoreService = { createOne, updateOne, deleteOne, fetchOne, fetchAll, fetchData, getOneByField };
export default FirestoreService;
