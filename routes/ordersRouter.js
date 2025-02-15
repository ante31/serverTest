const express = require('express');
const { ref, get, push, set, update } = require('firebase/database');
const database = require('../dbConnect');
const { sendPushNotification } = require('../services/sendPushNotification');

const orderRouter = express.Router();

orderRouter.get('/', async (req, res) => {
  try {
    console.log("OrderRouter get");
    const reference = ref(database, 'Orders');
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No data available in Firebase');
    }
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    res.status(500).send('Failed to fetch data from Firebase');
  }
});

orderRouter.post('/', async (req, res) => {
  try {
    console.log('Order submitted', req.body);
    
    // Extract and format date from time
    const time = new Date(req.body.time);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset()); // Convert UTC to local
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const day = String(time.getDate()).padStart(2, '0');
    
    console.log(time);
    console.log(year, month, day)

    // Reference the order location in the database
    const reference = ref(database, `Orders/${year}/${month}/${day}`);
    const newOrderRef = push(reference);
    
    await set(newOrderRef, req.body);

    res.status(201).json({ id: newOrderRef.key });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Failed to create order');
  }
});

orderRouter.get('/:year/:month/:day', async (req, res) => {
  try {
    const { year, month, day } = req.params;
    console.log(year, month, day);
    console.log(`Fetching orders for ${year}-${month}-${day}`);

    const reference = ref(database, `Orders/${year}/${month}/${day}`);
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      const orders = snapshot.val();
      // Convert to array while keeping IDs and filtering out rejected orders
      // const nonRejectedOrders = Object.entries(orders)
      //   .filter(([id, order]) => order.status !== 'rejected')
      //   .map(([id, order]) => ({ id, ...order }));

      res.json(orders);
    } else {
      res.status(404).send('No orders found for this date');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Failed to fetch orders');
  }
});


// PATCH endpoint to update order status
orderRouter.patch('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params; // Extract orderId from the URL
    const { status, year, month, day } = req.body; // Extract new status from the body (accepted or rejected)
    
    console.log(`Updating order ${orderId} status to ${status}`);
    console.log(year, month, day);
    if (!status || (status !== 'accepted' && status !== 'rejected' && status !== 'completed')) {
      return res.status(400).send('Invalid status. Please provide "accepted" or "rejected"');
    }

    // Find the path where this order exists
    const reference = ref(database, `Orders/${year}/${month}/${day}/${orderId}`);

    // Fetch current order data to check if it exists
    const snapshot = await get(reference);
    
    if (!snapshot.exists()) {
      return res.status(404).send('Order not found');
    }

    const orderData = snapshot.val();
    const pushToken = orderData.token;
    console.log(pushToken);
    if (!pushToken) {
      console.log('No push token found for this order');
    } else {
      // Construct the message based on the status
      let message = '';
      const lang = orderData.language;
      let title = lang === 'hr' ? 'Obavijest' : 'Order Update';
      if (status === 'accepted') {
        message = lang === 'hr' ? 'Vaša narudžba je prihvaćena': `Your order has been accepted.`;
      } else if (status === 'rejected') {
        message = lang === 'hr' ? 'Vaša narudžba je odbijena': `Your order has been rejected.`;
      } else if (status === 'completed' && !orderData.isDelivery) {
        message = lang === 'hr' ? 'Vaša narudžba je završena': `Your order has been completed.`;
      }

      // Send the push notification (assumes you have a sendPushNotification function)
      await sendPushNotification(pushToken, title, message);
      console.log('Push notification sent to client');
    }

    // Update the status of the order in the database
    await update(reference, { status });

    res.status(200).send(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Failed to update order status');
  }
});
module.exports = orderRouter;

