const { sendSMS } = require("../services/sendSMS");

function frontendStatusSocket(io) {
  let activeFrontend = null; // čuvamo socketId + flag

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Logiranje frontenda
socket.on("frontend-logged-in", (data) => {
  if (!activeFrontend) {
    activeFrontend = { socketId: socket.id };
    //sendSMS("0958138612", "Frontend je aktivan!", data.timestamp);
    console.log("✅ SMS poslan: frontend je aktivan");
  } else {
    console.log("♻️ Frontend se reconnectao:", socket.id);
    activeFrontend.socketId = socket.id; // ažuriraj na novi id
  }
});


    // Fizičko zatvaranje taba (namjerni logout)
    socket.on("frontend-closed", (data) => {
      if (activeFrontend && activeFrontend.socketId === socket.id) {
        activeFrontend = null;
        //sendSMS("0958138612", "Frontend je zatvoren!", data.timestamp);
        console.log("✅ SMS poslan: frontend je zatvoren");
      }
    });

    // Heartbeat – backend zna da frontend "živi"
    socket.on("heartbeat", (data) => {
      if (activeFrontend && activeFrontend.socketId === socket.id) {
        console.log(`💓 Last heartbeat: ${data.timestamp}`);
      }
    });

    socket.on("disconnect", () => {
      // Ne šaljemo SMS jer disconnect može biti samo promjena IP-a ili mreže
      console.log("⚠️ Socket disconnected:", socket.id);
    });
  });
}

module.exports = frontendStatusSocket;
