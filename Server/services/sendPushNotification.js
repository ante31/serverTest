
// Helper function to send push notification
async function sendPushNotification(token, title, message) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token, // The Expo push token
          sound: 'default',
          title: title,
          body: message,
          // data: { orderId: 1234 }, // Optional: You can include additional data if needed
        }),
      });
  
      const responseData = await response.json();
      console.log('Push Notification Response:', responseData);
      return responseData;
    } catch (err) {
      console.error('Error sending push notification:', err);
    }
  }

  module.exports = { sendPushNotification };