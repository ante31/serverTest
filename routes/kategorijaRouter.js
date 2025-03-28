const express = require('express');
const { ref, get } = require('firebase/database');
const database = require('../dbConnect');

const kategorijaRouter = express.Router();

kategorijaRouter.get('/', async (req, res) => {
  try {
    const reference = ref(database, 'Kategorije');
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No categories available in Firebase');
    }
  } catch (error) {
    console.error('Error fetching categories from Firebase:', error);
    res.status(500).send('Failed to fetch categories from Firebase');
  }
});

module.exports = kategorijaRouter;
