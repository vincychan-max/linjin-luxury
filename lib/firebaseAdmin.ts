import admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  console.error('🔥 FIREBASE_SERVICE_ACCOUNT 未设置！检查 .env.local');
  throw new Error('Missing Firebase service account');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
  console.log('✅ 从环境变量加载 service account 成功');
} catch (error: any) {
  console.error('🔥 JSON 解析失败:', error.message);
  throw error;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK 初始化成功！');
}

export const adminDb = admin.firestore();