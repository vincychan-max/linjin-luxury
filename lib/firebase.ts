import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";  // ← 新增这行（关键！）

// 你的 config（保持不变）
const firebaseConfig = {
  apiKey: "AIzaSyCzw3WzPFGc3q2tv6T3yy_lvn7F9ComOTc",
  authDomain: "linjinluxury.firebaseapp.com",
  projectId: "linjinluxury",
  storageBucket: "linjinluxury.firebasestorage.app",
  messagingSenderId: "217715308711",
  appId: "1:217715308711:web:971b7f477f518d49238382",
  measurementId: "G-GERMZ7DMBF"
};

// 初始化
const app = initializeApp(firebaseConfig);

// 初始化服务
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);  // ← 新增这行（头像上传需要）