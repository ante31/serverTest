const { ref, onValue, get } = require('firebase/database');

function cjenikSocket(io, database) {
  console.log('🚀 cjenikSocket pokrenut...');

  const cjenikRef = ref(database, 'Cjenik');
  const previousStates = {}; // čuvamo zadnje stanje

  get(cjenikRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        console.log('❌ Nema Cjenika u bazi.');
        return;
      }

      const cjenikRoot = snapshot.val();
      console.log('📥 Dohvaćen Cjenik:', Object.keys(cjenikRoot));

      const categoryKeys = Object.keys(cjenikRoot);

      for (const category of categoryKeys) {
        const categoryRef = ref(database, `Cjenik/${category}`);
        console.log(`📡 Slušam promjene na: Cjenik/${category}`);

        onValue(categoryRef, (snapshot) => {
          const newData = snapshot.val() || {};

          // Uklanjamo "popularity" iz svake stavke za usporedbu
          const cleanedNew = removePopularity(newData);
          const cleanedOld = removePopularity(previousStates[category] || {});

          const hasChanges = JSON.stringify(cleanedNew) !== JSON.stringify(cleanedOld);

          if (hasChanges) {
            previousStates[category] = newData; // spremamo novo pravo stanje (s popularity)
            console.log(`📤 [Socket] Promjena za "${category}"`, newData);
            io.emit(`cjenik-update-${category}`, newData);
          } else {
            console.log(`⏸️ [Socket] Promjena "${category}" samo u popularity — ignoriram.`);
          }
        });
      }
    })
    .catch((error) => {
      console.error('🔥 Greška kod dohvaćanja Cjenika:', error);
    });
}

// 👇 Makni "popularity" iz svih jela
function removePopularity(categoryData) {
  const result = {};

  for (const [key, value] of Object.entries(categoryData)) {
    if (typeof value === 'object' && value !== null) {
      const { popularity, ...rest } = value;
      result[key] = rest;
    } else {
      result[key] = value;
    }
  }

  return result;
}

module.exports = cjenikSocket;
