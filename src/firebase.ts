import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { environment } from "./environment";
const serviceAccount: any = environment.firebase;

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

export default db;
