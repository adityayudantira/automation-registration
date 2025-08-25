const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const data = JSON.parse(fs.readFileSync("./wilayahLengkapClean.json", "utf-8"));

// Skema fleksibel untuk struktur hierarki lengkap
const wilayahSchema = new mongoose.Schema({}, { strict: false });

// 👉 Ubah nama koleksi
const KodeWilayah = mongoose.model("KodeWilayah", wilayahSchema, "kode_wilayah");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Terhubung ke MongoDB");

    await KodeWilayah.deleteMany({});
    await KodeWilayah.insertMany(Object.values(data));

    console.log("✅ Data wilayah lengkap berhasil dimasukkan ke koleksi 'kode_wilayah'");
    process.exit();
  } catch (err) {
    console.error("❌ Gagal import:", err);
    process.exit(1);
  }
}

seed();
