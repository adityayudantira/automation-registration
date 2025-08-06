const Sumur = require('../models/Sumur');
const Wilayah = require('../models/Wilayah');
const Fuse = require("fuse.js");
const { findBestMatchHierarki } = require("../utils/fuzzyHelper");
const { getSuggestions } = require('../utils/fuzzySuggest');
const { flattenWilayahToDesaList } = require("../utils/fuzzyFallback");

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
    const { kodeWilayah, jenis } = req.body;
    if (!kodeWilayah || jenis === undefined || jenis === null) {
      return res.status(400).json({ error: "kodeWilayah dan jenis wajib diisi" });
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
      desa: wilayah.desa
    });

    await newSumur.save();

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
exports.registrasiNamaFuzzy = async (req, res) => {
  let { provinsi, kabupaten, kecamatan, desa, jenis } = req.body;
  jenis = parseInt(jenis);

  if (![0, 1, 2].includes(jenis)) {
    return res.status(400).json({ error: "Jenis sumur tidak valid" });
  }

  try {
    if (!provinsi || !kabupaten || !kecamatan || !desa) {
      return res.status(400).json({ error: "Semua nama wilayah harus diisi" });
    }

    const wilayahList = await Wilayah.find().lean();
    const wilayahMap = {};
    for (const prov of wilayahList) {
      wilayahMap[prov.kode] = prov;
    }

    // 🔹 1. Coba pakai fuzzy hierarki dulu
    const hasil = findBestMatchHierarki({ provinsi, kabupaten, kecamatan, desa }, wilayahMap);

    // 🔹 2. Jika gagal lengkap, fallback ke Fuse.js
    if (!hasil?.desa) {
      const desaList = flattenWilayahToDesaList(wilayahMap);
      const fuse = new Fuse(desaList, {
        keys: ["full"],
        threshold: 0.4
      });

      const query = `${desa} ${kecamatan} ${kabupaten} ${provinsi}`.toLowerCase();
      const results = fuse.search(query);

      if (results.length === 0) {
        return res.status(404).json({ error: "Wilayah tidak ditemukan secara lengkap maupun fuzzy" });
      }

      const best = results[0].item;

      hasil.provinsi = { nama: best.provinsi };
      hasil.kabupaten = { nama: best.kabupaten };
      hasil.kecamatan = { nama: best.kecamatan };
      hasil.desa = { nama: best.nama, kode: best.kode };
    }

    const kodeWilayah = hasil.desa.kode;
    const prefix = `${kodeWilayah}.${jenis}`;
    const existing = await Sumur.find({ nomorRegistrasi: { $regex: `^${prefix}` } })
      .sort({ nomorRegistrasi: -1 })
      .limit(1);

    let urut = 1;
    if (existing.length > 0) {
      const lastNomor = existing[0].nomorRegistrasi;
      urut = parseInt(lastNomor.split(".").pop()) + 1;
    }

    const nomorBaru = `${prefix}.${urut.toString().padStart(3, "0")}`;

    const simpan = new Sumur({
      nomorRegistrasi: nomorBaru,
      kodeWilayah,
      jenis,
      provinsi: hasil.provinsi.nama,
      kabupaten: hasil.kabupaten.nama,
      kecamatan: hasil.kecamatan.nama,
      desa: hasil.desa.nama
    });
    await simpan.save();

    console.log("  nomorRegistrasi:", nomorBaru);console.log("✅ Registrasi fuzzy berhasil:", nomorBaru);
    console.log("  kodeWilayah:", kodeWilayah);
    console.log("  jenis:", jenis);

    res.json({
      nomorRegistrasi: nomorBaru,
      wilayah: {
        provinsi: hasil.provinsi.nama,
        kabupaten: hasil.kabupaten.nama,
        kecamatan: hasil.kecamatan.nama,
        desa: hasil.desa.nama
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

exports.updateSumur = async (req, res) => {
  const { id } = req.params;
  const { nama_perusahaan, provinsi, kabupaten, kecamatan, desa, jenis, status } = req.body;

  try {
    const sumur = await Sumur.findById(id);
    if (!sumur) return res.status(404).json({ error: "Data sumur tidak ditemukan" });

    // Update field-field yang diizinkan
    sumur.nama_perusahaan = nama_perusahaan || sumur.nama_perusahaan;
    sumur.provinsi = provinsi || sumur.provinsi;
    sumur.kabupaten = kabupaten || sumur.kabupaten;
    sumur.kecamatan = kecamatan || sumur.kecamatan;
    sumur.desa = desa || sumur.desa;
    sumur.jenis = jenis !== undefined ? jenis : sumur.jenis;
    sumur.status = status || sumur.status;

    await sumur.save();

    res.json({ message: "Data berhasil diperbarui", data: sumur });
  } catch (err) {
    console.error("Gagal update sumur:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat update" });
  }
};

exports.deleteSumur = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Sumur.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json({ success: true });
  } catch (err) {
    console.error("Gagal hapus:", err);
    res.status(500).json({ error: "Gagal menghapus data" });
  }
};
