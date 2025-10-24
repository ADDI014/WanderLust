// 1️⃣ Load environment variables
require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js"); // your sample data.js

// 2️⃣ Read MongoDB URL from .env
const MONGO_URL = "mongodb+srv://ankit2237129aiml:ankit2237129@alok.iadhh.mongodb.net/?appName=Alok";

// 3️⃣ Debug check
if (!MONGO_URL) {
    console.error("❌ ERROR: ATLASDB_URL not defined in .env");
    process.exit(1);
}
console.log("Mongo URL loaded successfully");

// 4️⃣ Connect to MongoDB
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ CONNECTED TO DB"))
.catch((err) => console.error("DB CONNECTION ERROR:", err));

// 5️⃣ Seed function
const initDB = async () => {
    try {
        // Delete existing listings
        await Listing.deleteMany({});
        console.log("🗑️  Existing listings cleared");

        // Insert new listings
        const listingsToInsert = initData.data.map((obj) => ({
            ...obj,
            owner: "65d5cc7572de5f86450b2436" // default owner
            // geometry is optional; skip for now
        }));

        await Listing.insertMany(listingsToInsert);
        console.log("✅ Data was initialized successfully");

        // Close connection
        await mongoose.connection.close();
        console.log("🔒 DB connection closed");
    } catch (err) {
        console.error("SEED ERROR:", err);
        await mongoose.connection.close();
    }
};

// 6️⃣ Run seed
initDB();
