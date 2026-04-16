const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('开始设置 Custom Claim...');  // 新增

const uid = 'XIsUUoHfWphxQn9PcoWUNawa4gw1';  // 确认 UID 正确

admin.auth().getUser(uid)
  .then(user => console.log('找到用户:', user.uid))
  .catch(err => console.log('找不到用户:', err));

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('管理员权限设置成功！');
    admin.auth().getUser(uid)
      .then(user => console.log('当前 claims:', user.customClaims))
      .catch(err => console.log('检查 claims 错误:', err));
  })
  .catch((error) => {
    console.log('设置失败，错误:', error);
  });