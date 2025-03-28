const express = require('express');
const { ref, get, update, remove, set } = require('firebase/database');
const database = require('../dbConnect');

const extrasRouter = express.Router();

extrasRouter.get('/', async (req, res) => {
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

extrasRouter.get('/:priloziName', async (req, res) => {
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

extrasRouter.post('/', async (req, res) => {
  try {
      const { name } = req.body;

      console.log('Adding category with name:', name);

      if (!name) {
          return res.status(400).send('Naziv kategorije je obavezan.');
      }

      const reference = ref(database, `Cjenik/Prilozi/${name}`);
      await set(reference, { naziv: name });

      res.status(201).json({ message: 'Kategorija priloga dodana.', name });
  } catch (error) {
      console.error('Greška pri dodavanju kategorije u Firebase:', error);
      res.status(500).send('Neuspješno dodavanje kategorije.');
  }
});

extrasRouter.delete('/:categoryName', async (req, res) => {
  try {
      const { categoryName } = req.params;

      if (!categoryName) {
          return res.status(400).send('Naziv kategorije je obavezan.');
      }

      const reference = ref(database, `Cjenik/Prilozi/${categoryName}`);
      await remove(reference);

      res.status(200).json({ message: `Kategorija '${categoryName}' uspješno obrisana.` });
  } catch (error) {
      console.error('Greška pri brisanju kategorije iz Firebasea:', error);
      res.status(500).send('Neuspješno brisanje kategorije.');
  }
});

extrasRouter.delete('/:categoryName/:extraKey', async (req, res) => {
  try {
      const { categoryName, extraKey } = req.params;
      console.log('Deleting extra with categoryName:', categoryName, 'and extraKey:', extraKey);

      if (!categoryName || !extraKey) {
          return res.status(400).send('Naziv kategorije i ključ priloga su obavezni.');
      }

      const reference = ref(database, `Cjenik/Prilozi/${categoryName}`);
      const snapshot = await get(reference);

      const existingData = snapshot.val();

      if (!existingData || !existingData[extraKey]) {
          return res.status(404).send('Prilog nije pronađen.');
      }

      // Remove the extra from the category
      delete existingData[extraKey];

      // Update the database
      await set(reference, existingData);

      res.status(200).json({ message: `Prilog '${extraKey}' uspješno obrisan iz kategorije '${categoryName}'.` });
  } catch (error) {
      console.error('Greška pri brisanju priloga iz Firebasea:', error);
      res.status(500).send('Neuspješno brisanje priloga.');
  }
});


extrasRouter.post('/:categoryName', async (req, res) => {
  try {
      const { categoryName } = req.params;
      const { name, nameEn, price } = req.body;  // assuming extra data is in the request body

      if (!categoryName || !name || !nameEn || !price) {
          return res.status(400).send('Svi podaci su obavezni.');
      }

      const reference = ref(database, `Cjenik/Prilozi/${categoryName}`);
      const snapshot = await get(reference);

      const existingData = snapshot.val() || {};
      const extraKey = `${name}|${nameEn}`;

      // Store extra as "croatian|english[price]"
      existingData[extraKey] = price;

      await set(reference, existingData);

      res.status(200).json({ message: `Prilog '${extraKey}' uspješno dodan u kategoriju '${categoryName}'.` });
  } catch (error) {
      console.error('Greška pri dodavanju priloga u Firebase:', error);
      res.status(500).send('Neuspješno dodavanje priloga.');
  }
});

extrasRouter.put('/:categoryName/:extraKey', async (req, res) => {
  try {
    const { categoryName, extraKey } = req.params;
    const { name_hr, name_en, price } = req.body;

    console.log("🔍 DEBUG: Primljeni parametri", req.params);
    console.log("🔍 DEBUG: Primljeni podaci", req.body);


    // Firebase referenca
    const reference = ref(database, `Cjenik/Prilozi/${categoryName}`);
    console.log("🔍 DEBUG: Firebase reference path", reference);

    const snapshot = await get(reference);
    const existingData = snapshot.val();

    console.log("🔍 DEBUG: Postojeći podaci u kategoriji", existingData);

    // Provjera postojanja ključa
    const normalizedExtraKey = extraKey.trim().toLowerCase();
    const existingKeys = Object.keys(existingData || {});
    const normalizedExistingKey = existingKeys.find(key => key.toLowerCase().trim() === normalizedExtraKey);

    if (!normalizedExistingKey) {
      console.error("❌ ERROR: Prilog '%s' nije pronađen u kategoriji '%s'", extraKey, categoryName);
      return res.status(404).send(`Prilog '${extraKey}' nije pronađen u kategoriji '${categoryName}'`);
    }

    console.log("🔍 DEBUG: Pronađen ključ:", normalizedExistingKey);

    // Normalizacija novog ključa
    const newKey = `${name_hr}|${name_en}`;
    if (newKey !== extraKey) {
      delete existingData[normalizedExistingKey];
    }

    // Ažuriranje sa novim ključem
    existingData[newKey] = price;
    console.log("🔍 DEBUG: Ažurirani podaci", existingData);

    await set(reference, existingData);

    res.status(200).json({ message: `Prilog '${name_hr}' uspješno uređen u kategoriji '${categoryName}'.` });
  } catch (error) {
    console.error('❌ ERROR: Greška pri uređivanju priloga u Firebase:', error);
    res.status(500).send('Neuspješno uređivanje priloga.');
  }
});







module.exports = extrasRouter;