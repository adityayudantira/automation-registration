const stringSimilarity = require("string-similarity");

const aliasMap = {
  "jakarta": "Daerah Khusus Ibukota Jakarta",
  "dki": "Daerah Khusus Ibukota Jakarta",
  "jogja": "DI Yogyakarta",
  "diy": "DI Yogyakarta",
  "ntb": "Nusa Tenggara Barat",
  "ntt": "Nusa Tenggara Timur",
  "sumbar": "Sumatera Barat",
  "sumut": "Sumatera Utara",
  "sumsel": "Sumatera Selatan",
  "kalbar": "Kalimantan Barat",
  "kaltim": "Kalimantan Timur",
  "kalsel": "Kalimantan Selatan",
  "kalteng": "Kalimantan Tengah",
  "kaltara": "Kalimantan Utara"
};

function normalize(text) {
  return text?.toLowerCase().trim() || "";
}

function applyAlias(input) {
  const norm = normalize(input);
  return aliasMap[norm] || input;
}

function fuzzySearch(input, list, minScore = 0.35) {
  if (!input || !list || !Array.isArray(list) || list.length === 0) return null;

  const cleaned = normalize(applyAlias(input));
  const validList = list.filter(item => item && typeof item.nama === "string");

  if (validList.length === 0) return null;

  const names = validList.map(item => normalize(item.nama));
  const match = stringSimilarity.findBestMatch(cleaned, names);
  const best = match.bestMatch;

  if (best.rating >= minScore) {
    return validList.find(item => normalize(item.nama) === best.target);
  }

  return null;
}

function findBestMatchHierarki(inputWilayah, dataWilayah) {
  const { provinsi, kabupaten, kecamatan, desa } = inputWilayah;
  let hasil = { provinsi: null, kabupaten: null, kecamatan: null, desa: null };

  if (!dataWilayah || typeof dataWilayah !== "object") return hasil;

  const provList = Object.values(dataWilayah);
  hasil.provinsi = fuzzySearch(provinsi, provList);
  if (!hasil.provinsi || !hasil.provinsi.kota) return hasil;

  // Ganti dari "kabupaten" ke "kota"
  const kabList = Object.values(hasil.provinsi.kota || {});
  hasil.kabupaten = fuzzySearch(kabupaten, kabList);
  if (!hasil.kabupaten || !hasil.kabupaten.kecamatan) return hasil;

  const kecList = Object.values(hasil.kabupaten.kecamatan);
  hasil.kecamatan = fuzzySearch(kecamatan, kecList);
  if (!hasil.kecamatan || !hasil.kecamatan.desa) return hasil;

  const desaList = Object.values(hasil.kecamatan.desa);
  hasil.desa = fuzzySearch(desa, desaList);
if (!hasil.provinsi) console.log("❌ Provinsi gagal");
if (!hasil.kabupaten) console.log("❌ Kabupaten/Kota gagal");
if (!hasil.kecamatan) console.log("❌ Kecamatan gagal");
if (!hasil.desa) console.log("❌ Desa gagal");

  return hasil;
}

module.exports = { findBestMatchHierarki };
