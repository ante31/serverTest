const express = require('express');
const { ref, get, set, remove } = require('firebase/database');
const database = require('../dbConnect');

const annotationsRouter = express.Router();

annotationsRouter.get('/', async (req, res) => {
  try {
    const reference = ref(database, 'Blacklist');
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No annotations available in Firebase');
    }
  } catch (error) {
    console.error('Error fetching annotations from Firebase:', error);
    res.status(500).send('Failed to fetch annotations from Firebase');
  }
});

annotationsRouter.post('/', async (req, res) => {
  try {
    const newAnnotation = req.body;

    console.log('Annotation data:', newAnnotation);

    // Reference to Blacklist/phoneNumber
    const reference = ref(database, `Blacklist/${newAnnotation.phone}`);

    // Set data at that location
    await set(reference, newAnnotation);

    res.json({ message: "Annotation added successfully", id: newAnnotation.phone, data: newAnnotation });
  } catch (error) {
    console.error('Error adding Annotation to Firebase:', error);
    res.status(500).send('Failed to add Annotation to Firebase');
  }
});

annotationsRouter.delete('/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    const reference = ref(database, `Blacklist/${phone}`);

    await remove(reference);

    res.json({ message: `Phone ${phone} removed from blacklist.` });
  } catch (error) {
    console.error('Error removing phone from blacklist:', error);
    res.status(500).send('Failed to remove phone from blacklist');
  }
});


module.exports = annotationsRouter;

