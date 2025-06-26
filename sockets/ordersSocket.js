const { ref, onValue, onChildAdded, onChildChanged } = require('firebase/database');

// Pretpostavimo da je "title" naziv kategorije cjenika
function OrdersSocket(io, database) {

// Firebase listener – narudžbe za danas
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const ordersPath = `Orders/${year}/${month}/${day}`;

const ordersRef = ref(database, ordersPath);

onChildAdded(ordersRef, (snapshot) => {
  const newOrder = snapshot.val();
  const orderId = snapshot.key;
  console.log('🆕 Firebase → Nova narudžba dodana:', orderId, newOrder);

  io.emit('order-added', {
    id: orderId,
    ...newOrder
  });
});

onChildChanged(ordersRef, (snapshot) => {
  const updatedOrder = snapshot.val();
  const orderId = snapshot.key;

  // Ako postoji status (npr. 'accepted', 'rejected', 'pending')
  if (updatedOrder.status) {
    console.log('🔄 Firebase → Status narudžbe promijenjen:', orderId, updatedOrder.status);

    // Emit samo za tu narudžbu
    io.emit(`order-updated-${orderId}`, {
      id: orderId,
      ...updatedOrder
    });
  }
});
}

module.exports = OrdersSocket;