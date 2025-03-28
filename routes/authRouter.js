const express = require('express');
const bcrypt = require('bcryptjs');
const { ref, get, update, remove, set } = require('firebase/database');
const database = require('../dbConnect'); // Ensure this connects to your Firebase Realtime Database

const authRouter = express.Router();

authRouter.post('/login/:pass', async (req, res) => {
  try {
    const { pass } = req.params; // Get the password from the URL parameters
    console.log("pass", pass);

    // Reference to the password stored in Firebase
    const reference = ref(database, 'General/pass');
    const snapshot = await get(reference);

    if (snapshot.exists()) {
      const storedPass = snapshot.val(); // Get the stored password from Firebase
      console.log("bcypt",  bcrypt.hashSync(storedPass));

      // Compare the provided password with the stored password
      if (bcrypt.compareSync(pass, storedPass)) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Incorrect password' });
      }
    } else {
      res.status(404).send('No password available in Firebase');
    }
  } catch (error) {
    console.error('Error fetching password from Firebase:', error);
    res.status(500).send('Failed to fetch password from Firebase');
  }
});

module.exports = authRouter;