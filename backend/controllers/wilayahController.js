const Wilayah = require('../models/Wilayah');

// GET /wilayah/provinsi
exports.getProvinsi = async (req, res) => {
  try {
    const data = await Wilayah.find().lean();
    const provinsi = data.map(d => ({
      kode: d.kode,
      nama: d.nama
    }));
    res.json(provinsi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /wilayah/kabupaten/:kodeProvinsi
exports.getKabupaten = async (req, res) => {
  const { kodeProvinsi } = req.params;
  try {
    const prov = await Wilayah.findOne({ kode: kodeProvinsi }).lean();
    if (!prov || !prov.kota) return res.json([]);

    const hasil = Object.values(prov.kota).map(kab => ({
      kode: kab.kode,
      nama: kab.nama
    }));
    res.json(hasil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /wilayah/kecamatan/:kodeKabupaten
exports.getKecamatan = async (req, res) => {
  const { kodeKabupaten } = req.params;
  const [kodeProvinsi] = kodeKabupaten.split('.');
  try {
    const prov = await Wilayah.findOne({ kode: kodeProvinsi }).lean();
    const kab = prov?.kota?.[kodeKabupaten];
    if (!kab || !kab.kecamatan) return res.json([]);

    const hasil = Object.values(kab.kecamatan).map(kec => ({
      kode: kec.kode,
      nama: kec.nama
    }));
    res.json(hasil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /wilayah/kelurahan/:kodeKecamatan
exports.getKelurahan = async (req, res) => {
  const { kodeKecamatan } = req.params;
  const [kodeProvinsi, kodeKabupaten] = kodeKecamatan.split('.').slice(0, 2);
  const fullKodeKab = `${kodeProvinsi}.${kodeKabupaten}`;

  try {
    const prov = await Wilayah.findOne({ kode: kodeProvinsi }).lean();
    const kec = prov?.kota?.[fullKodeKab]?.kecamatan?.[kodeKecamatan];
    if (!kec || !kec.desa) return res.json([]);

    const hasil = Object.values(kec.desa).map(desa => ({
      kode: desa.kode,
      nama: desa.nama
    }));
    res.json(hasil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
