// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Firebase
const database = require('./dbConnect');
const { ref, onValue } = require('firebase/database');

// Routeri
const cjenikRouter = require('./routes/cjenikRouter');
const kategorijaRouter = require('./routes/kategorijaRouter');
const orderRouter = require('./routes/ordersRouter');
const generalRouter = require('./routes/generalRouter');
const extrasRouter = require('./routes/extrasRouter');
const authRouter = require('./routes/authRouter');
const annotationsRouter = require('./routes/annotationsRouter');
const qrRedirecter = require('./qrRedirecter');

// Express + socket.io setup
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // Prilagodi ako frontend nije localhost
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3000;
const localhost = "192.168.190.14";

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Test ruta
app.get('/', (req, res) => {
  res.send('Hello from the server side!');
});

// API rute
app.use('/cjenik', cjenikRouter);
app.use('/orders', orderRouter);
app.use('/kategorije', kategorijaRouter);
app.use('/general', generalRouter);
app.use('/extras', extrasRouter);
app.use('/auth', authRouter);
app.use('/annotations', annotationsRouter);
app.use('/qr', qrRedirecter);

// Drži zadnje stanje general podataka
let currentGeneralData = null;

const generalRef = ref(database, 'General');

// Jedan globalni listener na Firebase 'General' path
onValue(generalRef, (snapshot) => {
  const data = snapshot.val();
  currentGeneralData = data;
  console.log('🔥 Firebase → General updated:', data);
  io.emit('general-update', data); // emitaj svim klijentima
});

io.on('connection', (socket) => {
  console.log('📡 Frontend connected:', socket.id);

  if (currentGeneralData !== null) {
    socket.emit('general-update', currentGeneralData); // Send immediately
  }
});



// Pokretanje servera
server.listen(port, () => {
  console.log(`🚀 Server is running on http://${localhost}:${port}`);
});
