const { sendSMS } = require("../services/sendSMS");

// Funkcija za praćenje aktivnog frontenda
function frontendStatusSocket(io, database) {
  let frontendActive = false;

  io.on('connection', (socket) => {
        // Frontend se logirao (modal možda zatvoren)
    socket.on('frontend-logged-in', (data) => {
      console.log('Frontend logged in:', data);
      sendSMS("0916229322", "Frontend je aktivan!", data.timestamp); // send SMS
      sendSMS("0916229322", "Frontend je aktivan!", data.timestamp); // send SMS
    });

    // Frontend se zatvorio / disconnect
    socket.on('frontend-closed', (data) => {
      console.log('Frontend closed:', data);
      sendSMS("0916229322", "Frontend je zatvoren!", data.timestamp); // send SMS
      sendSMS("0916229322", "Frontend je zatvoren!", data.timestamp); // send SMS
    });
    frontendActive = true;

    // Heartbeat event (opcionalno)
    socket.on('heartbeat', () => {
      frontendActive = true;
    });

    socket.on('disconnect', () => {
      console.log('Frontend disconnected:', socket.id);
      frontendActive = false;
      console.log('Frontend nije aktivan!'); // sample log
    });
  });

  setInterval(() => {
    if (!frontendActive) {
      console.log('Nema aktivnog frontenda!');
    }
    frontendActive = false;
  }, 5000);
}

module.exports = frontendStatusSocket;
