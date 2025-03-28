const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cjenikRouter = require('./routes/cjenikRouter');
const kategorijaRouter = require('./routes/kategorijaRouter');
const orderRouter = require('./routes/ordersRouter');
const generalRouter = require('./routes/generalRouter');
const extrasRouter = require('./routes/extrasRouter');
const authRouter = require('./routes/authRouter');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.json()); // This allows Express to parse JSON bodies
const localhost = "localhost";

app.use(cors({
  origin: '*', 
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.get('/', (req, res) => {
  res.send('Hello from the server side!');
});

app.use('/cjenik', cjenikRouter);
app.use('/orders', orderRouter);
app.use('/kategorije', kategorijaRouter);
app.use('/general', generalRouter);
app.use('/extras', extrasRouter);
app.use('/auth', authRouter);

const port = process.env.PORT || 3000;
// Pokretanje servera
app.listen(port, () => {
  console.log(`Server is running on http:${localhost}:${port}`);
});