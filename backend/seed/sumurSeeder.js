const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // sesuaikan dengan struktur .env kamu

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sumurdb';

// Load data dari file
const data = JSON.parse(fs.readFileSync(__dirname + '/sumurs.json', 'utf-8'));

// Model dynamic untuk seed
const sumurSchema = new mongoose.Schema({}, { strict: false });
const Sumur = mongoose.model('sumurs', sumurSchema);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('🔌 Connected to MongoDB');
  
  try {
    await Sumur.deleteMany(); // kalau mau clear dulu
    await Sumur.insertMany(data);
    console.log(`✅ Berhasil import ${data.length} sumur`);
  } catch (err) {
    console.error('❌ Gagal import:', err);
  } finally {
    mongoose.disconnect();
  }
});
