// seeder/seedUsers.js
const mongoose = require("mongoose");
const User = require("../models/User"); // sesuaikan path kalau beda

const MONGO_URI = "mongodb://127.0.0.1:27017/sumurdb"; // sesuaikan

const users = [
  { email: "jena@admin.com", name: "Jena", role: "admin", password: "Jena89" },
  { email: "ninne@admin.com", name: "Ninne", role: "admin", password: "Ninne89" },
  { email: "firman@admin.com", name: "Firman", role: "admin", password: "Firman89" },
  { email: "adit@admin.com", name: "Adit", role: "admin", password: "Adit89" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    // Kosongkan dulu collection user
    await User.deleteMany({});

    // Insert satu2 pakai save → auto hash
    for (const u of users) {
      const user = new User(u);
      await user.save();
    }

    console.log("✅ Users seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seed();
