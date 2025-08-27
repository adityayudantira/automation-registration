const mongoose = require('mongoose');

const SumurSchema = new mongoose.Schema({
  kodeWilayah: String, // Contoh: 13.71.03.1007
  jenis: Number, // 0, 1, atau 2
  urutan: Number, // 1, 2, 3...
  nomorRegistrasi: String, // Contoh: 13.71.03.1007.0.001
  provinsi: String,
  kabupaten: String,
  kecamatan: String,
  desa: String,
  tanggalRegistrasi: { type: Date, default: Date.now },
  id_perusahaan: {
    type: String,
    required: true,
    unique: true, // id_perusahaan unik
  },
  nomor_sumur: String,
  nama_perusahaan: String,
  dataLain: mongoose.Schema.Types.Mixed, // Untuk simpan field tambahan dari form
  status: {
    type: String,
    default: "Aktif"
  }
}, { timestamps: true });

module.exports = mongoose.model('Sumur', SumurSchema, 'sumurs');
