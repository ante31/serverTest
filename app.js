// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Firebase
const database = require('./dbConnect');

// Sockets
const generalSocket = require('./sockets/generalSocket');
const cjenikSocket = require('./sockets/cjenikSocket');
const ordersSocket = require('./sockets/ordersSocket');
const frontendStatusSocket = require('./sockets/frontendStatusSocket');

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
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'], // dodaj ovo ako frontend to traži
});


const port = process.env.PORT || 3000;
const localhost = "localhost";

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


generalSocket(io, database);
ordersSocket(io, database);
cjenikSocket(io, database);
frontendStatusSocket(io, database);

// Pokretanje servera
server.listen(port, () => {
  console.log(`🚀 Server is running on http://${localhost}:${port}`);
});