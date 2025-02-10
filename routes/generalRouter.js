const express = require('express');
const { ref, get } = require('firebase/database');
const database = require('../dbConnect');

const generalRouter = express.Router();

generalRouter.get('/', async (req, res) => {
  try {
    const reference = ref(database, 'General');
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No general available in Firebase');
    }
  } catch (error) {
    console.error('Error fetching general from Firebase:', error);
    res.status(500).send('Failed to fetch general from Firebase');
  }
});

module.exports = generalRouter;
