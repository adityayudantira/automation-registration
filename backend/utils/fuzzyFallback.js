// backend/utils/fuzzyFallback.js

function flattenWilayahToDesaList(wilayahMap) {
  const desaList = [];

  for (const kodeProv in wilayahMap) {
    const prov = wilayahMap[kodeProv];
    for (const kodeKab in prov.kota || {}) {
      const kab = prov.kota[kodeKab];
      for (const kodeKec in kab.kecamatan || {}) {
        const kec = kab.kecamatan[kodeKec];
        for (const kodeDesa in kec.desa || {}) {
          const desa = kec.desa[kodeDesa];

          desaList.push({
            kode: desa.kode,
            nama: desa.nama,
            kecamatan: kec.nama,
            kabupaten: kab.nama,
            provinsi: prov.nama,
            full: `${desa.nama} ${kec.nama} ${kab.nama} ${prov.nama}`.toLowerCase()
          });
        }
      }
    }
  }

  return desaList;
}

module.exports = { flattenWilayahToDesaList };
