const { ref, onValue } = require('firebase/database');

function generalSocket(io, database) {
  let currentGeneralData = null;

  const generalRef = ref(database, 'General');

  onValue(generalRef, (snapshot) => {
    const data = snapshot.val();
    currentGeneralData = data;
    console.log('🔥 Firebase → General updated:', data);
    io.emit('general-update', data);
  });

  io.on('connection', (socket) => {
    console.log('rontend connected:', socket.id);

    if (currentGeneralData !== null) {
      socket.emit('general-update', currentGeneralData);
    }
  });
}

module.exports = generalSocket;
