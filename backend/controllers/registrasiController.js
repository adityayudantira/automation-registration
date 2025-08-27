const Sumur = require('../models/Sumur');
const Wilayah = require('../models/Wilayah');
const Fuse = require("fuse.js");
const { findBestMatchHierarki } = require("../utils/fuzzyHelper");
const { getSuggestions } = require('../utils/fuzzySuggest');
const { flattenWilayahToDesaList } = require("../utils/fuzzyFallback");

//google api
const { google } = require("googleapis");
const path = require("path");
const {
  appendToGoogleSheets,
  updateGoogleSheetsById,
  deleteGoogleSheetsById
} = require("../utils/googleSheets");


// Fungsi bantu: pad angka ke 3 digit
const padUrutan = (angka) => angka.toString().padStart(3, '0');

// Fungsi bantu: cek apakah kode kelurahan valid dalam struktur nested
const findKelurahan = async (kodeWilayah) => {
  const [prov, kab, kec, kel] = kodeWilayah.split('.');
  const kodeProv = prov;
  const kodeKab = `${prov}.${kab}`;
  const kodeKec = `${prov}.${kab}.${kec}`;
  const kodeDesa = kodeWilayah;

  const data = await Wilayah.findOne({ kode: kodeProv }).lean();
  const kelurahan = data?.kota?.[kodeKab]?.kecamatan?.[kodeKec]?.desa?.[kodeDesa];
  return kelurahan || null;
};

// POST /registrasi
exports.registrasiSumur = async (req, res) => {
  try {
    const { kodeWilayah, jenis, nama_perusahaan, id_perusahaan, nomor_sumur } = req.body;

    if (!kodeWilayah || jenis === undefined || jenis === null) {
      return res.status(400).json({ error: "kodeWilayah dan jenis wajib diisi" });
    }

    // Cek duplikat id_perusahaan
    if (id_perusahaan) {
      const exists = await Sumur.findOne({ id_perusahaan });
      if (exists) {
        return res.status(409).json({ message: "❌ id_perusahaan sudah terdaftar" });
      }
    }

    const [prov, kota, kec, desa] = kodeWilayah.split('.');
    const kodeProvinsi = prov;
    const kodeKabupaten = `${prov}.${kota}`;
    const kodeKecamatan = `${prov}.${kota}.${kec}`;
    const kodeDesa = kodeWilayah;

    const provinsiDoc = await Wilayah.findOne({ kode: kodeProvinsi }).lean();
    if (!provinsiDoc) return res.status(404).json({ error: "Provinsi tidak ditemukan" });

    const kotaObj = provinsiDoc.kota?.[kodeKabupaten];
    const kecObj = kotaObj?.kecamatan?.[kodeKecamatan];
    const desaObj = kecObj?.desa?.[kodeDesa];

    if (!desaObj) return res.status(404).json({ error: "Wilayah tidak lengkap atau tidak ditemukan" });

    const wilayah = {
      provinsi: provinsiDoc.nama,
      kabupaten: kotaObj.nama,
      kecamatan: kecObj.nama,
      desa: desaObj.nama
    };

    // Hitung jumlah sumur yang sudah ada di wilayah + jenis tersebut
    const jumlah = await Sumur.countDocuments({
      kodeWilayah,
      jenis
    });

    const noUrut = String(jumlah + 1).padStart(3, '0');
    const nomorRegistrasi = `${kodeWilayah}.${jenis}.${noUrut}`;

    // Simpan ke database
    const newSumur = new Sumur({
      nomorRegistrasi,
      kodeWilayah,
      jenis,
      provinsi: wilayah.provinsi,
      kabupaten: wilayah.kabupaten,
      kecamatan: wilayah.kecamatan,
      desa: wilayah.desa,
      nama_perusahaan,
      id_perusahaan,
      nomor_sumur
    });

    await newSumur.save();
    
    // Tambah juga ke Google Sheets
    try {
      await appendToGoogleSheets(newSumur.toObject());
    } catch (err) {
      console.error("❌ Gagal simpan ke Google Sheets:", err.message);
    }


    res.status(201).json({
      nomorRegistrasi,
      wilayah
    });

  } catch (err) {
    console.error("Registrasi error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};


// Registrasi manual sumur
// Registrasi manual sumur dengan fuzzy + Google Sheets
exports.registrasiNamaFuzzy = async (req, res) => {
  let { provinsi, kabupaten, kecamatan, desa, jenis, nama_perusahaan, id_perusahaan, nomor_sumur } = req.body;
  jenis = parseInt(jenis);

  if (![0, 1, 2].includes(jenis)) {
    return res.status(400).json({ error: "Jenis sumur tidak valid" });
  }

  if (!provinsi || !kabupaten || !kecamatan || !desa) {
    return res.status(400).json({ error: "Semua nama wilayah harus diisi" });
  }
  
  try {
    // 🔎 Cek duplikat id_perusahaan
    if (id_perusahaan) {
      const exists = await Sumur.findOne({ id_perusahaan });
      if (exists) return res.status(409).json({ message: "❌ id_perusahaan sudah terdaftar" });
    }

    // 🔎 Ambil semua wilayah
    const wilayahList = await Wilayah.find().lean();
    const wilayahMap = {};
    for (const prov of wilayahList) {
      wilayahMap[prov.kode] = prov;
    }

    // 1️⃣ Coba fuzzy hierarki
    let hasil = findBestMatchHierarki({ provinsi, kabupaten, kecamatan, desa }, wilayahMap);

    // 2️⃣ Fallback Fuse.js jika tidak lengkap
    if (!hasil?.desa) {
      const desaList = flattenWilayahToDesaList(wilayahMap);
      const fuse = new Fuse(desaList, { keys: ["full"], threshold: 0.4 });
      const query = `${desa} ${kecamatan} ${kabupaten} ${provinsi}`.toLowerCase();
      const results = fuse.search(query);

      if (results.length === 0) {
        return res.status(404).json({ error: "Wilayah tidak ditemukan secara lengkap maupun fuzzy" });
      }

      const best = results[0].item;
      hasil = {
        provinsi: { nama: best.provinsi },
        kabupaten: { nama: best.kabupaten },
        kecamatan: { nama: best.kecamatan },
        desa: { nama: best.nama, kode: best.kode }
      };
    }

    const kodeWilayah = hasil.desa.kode;
    const prefix = `${kodeWilayah}.${jenis}`;

    // Cari nomor terakhir
    const existing = await Sumur.find({ nomorRegistrasi: { $regex: `^${prefix}` } })
      .sort({ nomorRegistrasi: -1 })
      .limit(1);

    let urut = 1;
    if (existing.length > 0) {
      const lastNomor = existing[0].nomorRegistrasi;
      urut = parseInt(lastNomor.split(".").pop()) + 1;
    }

    const nomorBaru = `${prefix}.${urut.toString().padStart(3, "0")}`;

    // Simpan ke MongoDB
    const simpan = new Sumur({
      nomorRegistrasi: nomorBaru,
      kodeWilayah,
      jenis,
      provinsi: hasil.provinsi.nama,
      kabupaten: hasil.kabupaten.nama,
      kecamatan: hasil.kecamatan.nama,
      desa: hasil.desa.nama,
      nama_perusahaan,
      id_perusahaan,
      nomor_sumur
    });
    await simpan.save();

    // Tambah ke Google Sheets (gunakan appendToGoogleSheets konsisten)
    try {
      await appendToGoogleSheets(simpan.toObject());
    } catch (err) {
      console.error("❌ Gagal simpan ke Google Sheets:", err.message);
    }


    console.log("✅ Registrasi fuzzy berhasil:", nomorBaru);

    res.status(201).json({
      nomorRegistrasi: nomorBaru,
      wilayah: {
        provinsi: hasil.provinsi.nama,
        kabupaten: hasil.kabupaten.nama,
        kecamatan: hasil.kecamatan.nama,
        desa: hasil.desa.nama,
        nama_perusahaan,
        id_perusahaan,
        nomor_sumur
      }
    });

  } catch (err) {
    console.error("Registrasi fuzzy error:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat registrasi fuzzy" });
  }
};

    

exports.getSaranWilayah = async (req, res) => {
  const { provinsi, kabupaten, kecamatan, desa } = req.body;

  try {
    const data = await Wilayah.find().lean();
    const saran = {
      provinsi: [],
      kabupaten: [],
      kecamatan: [],
      desa: []
    };

    // Provinsi
    const provOptions = data.map(p => ({ kode: p.kode, nama: p.nama }));
    const provRes = getSuggestions(provinsi || '', provOptions);
    const matchedProv = provRes.match;

    saran.provinsi = provRes.suggestions;

    if (matchedProv) {
      // Kabupaten
      const kabOptions = Object.values(matchedProv.kota || {});
      const kabRes = getSuggestions(kabupaten || '', kabOptions);
      const matchedKab = kabRes.match;

      saran.kabupaten = kabRes.suggestions;

      if (matchedKab) {
        // Kecamatan
        const kecOptions = Object.values(matchedKab.kecamatan || {});
        const kecRes = getSuggestions(kecamatan || '', kecOptions);
        const matchedKec = kecRes.match;

        saran.kecamatan = kecRes.suggestions;

        if (matchedKec) {
          // Desa
          const desaOptions = Object.values(matchedKec.desa || {});
          const desaRes = getSuggestions(desa || '', desaOptions);

          saran.desa = desaRes.suggestions;
        }
      }
    }

    res.json({ saran });
  } catch (err) {
    console.error('Gagal generate saran wilayah:', err);
    res.status(500).json({ error: 'Gagal generate saran wilayah' });
  }
};

exports.getAllSumur = async (req, res) => {
  try {
    const data = await Sumur.find().sort({ createdAt: -1 });
    const formatted = data.map(d => ({
      id: d._id,
      reg_sumur: d.nomorRegistrasi,
      nama_perusahaan: d.nama_perusahaan || "-",
      provinsi: d.provinsi || "-",
      kabupaten: d.kabupaten || "-",
      kecamatan: d.kecamatan || "-",
      desa: d.desa || "-",
      jenis: d.jenis,
      status: d.status || "Aktif"
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data sumur" });
  }
};

// Update data berdasarkan _id Mongo
exports.updateSumur = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Sumur.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Data tidak ditemukan di MongoDB" });
    }

    // kalau ada id_perusahaan, update juga di Sheet
    if (updated.id_perusahaan) {
      try {
        await updateGoogleSheetsById(updated.id_perusahaan, updated.toObject());
      } catch (err) {
        console.error("❌ Gagal update Google Sheets:", err.message);
      }
    }

    res.json({ message: "Data berhasil diupdate", data: updated });
  } catch (err) {
    console.error("❌ Error update data:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Hapus data berdasarkan _id Mongo
exports.deleteSumur = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Sumur.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Data tidak ditemukan di MongoDB" });
    }

    // kalau ada id_perusahaan, hapus juga dari Sheet
    if (deleted.id_perusahaan) {
      try {
        await deleteGoogleSheetsById(deleted.id_perusahaan);
      } catch (err) {
        console.error("❌ Gagal hapus di Google Sheets:", err.message);
      }
    }

    res.json({ message: "Data berhasil dihapus", data: deleted });
  } catch (err) {
    console.error("❌ Error hapus data:", err.message);
    res.status(500).json({ error: err.message });
  }
};
