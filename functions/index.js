const functions = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.generateOrderNumber = functions.onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  if (data.order_number) return; // 已生成跳过

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // 20260123

  const counterRef = admin.firestore().doc("counters/orders");
  const newCount = await admin.firestore().runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const current = counterDoc.exists ? counterDoc.data().count || 0 : 0;
    const next = current + 1;
    transaction.set(counterRef, { count: next });
    return next;
  });

  const orderNumber = `LJ-${date}-${String(newCount).padStart(3, '0')}`;

  await admin.firestore().doc(`orders/${event.params.orderId}`).update({
    order_number: orderNumber
  });
});