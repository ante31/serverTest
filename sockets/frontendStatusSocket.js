const { sendSMS } = require("../services/sendSMS");

function frontendStatusSocket(io, database) {
  let activeFrontendSocketId = null; // samo jedan aktivni frontend

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Frontend se logirao
    socket.on('frontend-logged-in', (data) => {
      if (!activeFrontendSocketId) {
        activeFrontendSocketId = socket.id;
        sendSMS("0958138612", "Frontend je aktivan!", data.timestamp);
        console.log('SMS poslan: frontend je aktivan');
      }
    });

    // Frontend se zatvorio
    socket.on('frontend-closed', (data) => {
      if (activeFrontendSocketId === socket.id) {
        activeFrontendSocketId = null;
        sendSMS("0958138612", "Frontend je zatvoren!", data.timestamp);
        console.log('SMS poslan: frontend je zatvoren');
      }
    });

    // Heartbeat event (opcionalno)
    socket.on('heartbeat', () => {
      // možeš koristiti za održavanje konekcije
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      if (activeFrontendSocketId === socket.id) {
        activeFrontendSocketId = null;
        sendSMS("0958138612", "Frontend je zatvoren!", new Date().toISOString());
        console.log('SMS poslan: frontend je zatvoren (disconnect)');
      }
    });
  });
}

module.exports = frontendStatusSocket;
