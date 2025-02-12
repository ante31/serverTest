const express = require('express');
const { ref, get } = require('firebase/database');
const database = require('../dbConnect');

const cjenikRouter = express.Router();

cjenikRouter.get('/', async (req, res) => {
  try {
    const reference = ref(database, 'Cjenik');
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

cjenikRouter.get('/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const reference = ref(database, `Cjenik/${title}`);
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send(`No item found in Cjenik with title: ${title}`);
    }
  } catch (error) {
    console.error('Error fetching item from Firebase:', error);
    res.status(500).send('Failed to fetch item from Firebase');
  }
});

cjenikRouter.get('/prilozi/:priloziName', async (req, res) => {
  try {
    const { priloziName } = req.params; // Dohvati parametar priloziName iz query stringa

    // Provjeri je li priloziName prisutan
    if (!priloziName) {
      return res.status(400).send('Prilozi name is required');
    }

    // Dohvati podatke iz baze na temelju priloziName
    const reference = ref(database, `Cjenik/Prilozi/${priloziName}`);
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send(`No extras found for priloziName: ${priloziName}`);
    }
  } catch (error) {
    console.error('Error fetching extras from Firebase:', error);
    res.status(500).send('Failed to fetch extras from Firebase');
  }
});

cjenikRouter.get('/prilozi', async (req, res) => {
  try {
    const reference = ref(database, 'Cjenik/Prilozi');
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

module.exports = cjenikRouter;
