const mongoose = require('mongoose');

const WilayahSchema = new mongoose.Schema({
  kode: String,
  nama: String,
  tingkat: String, // "provinsi", "kabupaten", "kecamatan", "kelurahan"
});

module.exports = mongoose.model('Wilayah', WilayahSchema, 'kode_wilayah');
