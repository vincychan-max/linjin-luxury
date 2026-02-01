import admin from 'firebase-admin';

if (!admin.apps.length) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('🔥 Firebase Admin 环境变量缺失！请检查 Vercel Environment Variables 是否设置了：');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    throw new Error('Missing Firebase Admin credentials');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin SDK 初始化成功！');
  } catch (error: any) {
    console.error('🔥 Firebase Admin 初始化失败:', error.message);
    throw error;
  }
}

export const adminDb = admin.firestore();