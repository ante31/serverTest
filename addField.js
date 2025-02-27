const database = require("./dbConnect");
const { ref, get, update } = require('firebase/database');

async function addPopularityField() {
    try {
        console.log("Fetching meals from Firebase...");
        const reference = ref(database, 'Cjenik');
        const snapshot = await get(reference);
        const categories = snapshot.val();

        if (!categories) {
            console.log("No categories found.");
            return;
        }

        console.log("Processing categories...");
        const updates = {};

        for (const category in categories) {
            if  (category === "Prilozi") continue;
            for (const id in categories[category]) {
                const mealRef = ref(database, `Cjenik/${category}/${id}`); // Make 'meal' a reference
                const meal = categories[category][id];

                if (meal.popularity === undefined) {
                    console.log(`Updating meal ${id} in category ${category}`);
                    await update(mealRef, { popularity: 0 });
                }
            }
        }

        console.log("All missing popularity fields have been added.");
    } catch (error) {
        console.error("Error updating database:", error);
    }
}

module.exports = addPopularityField;
