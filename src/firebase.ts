import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = require("../firebase.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

export default db;
