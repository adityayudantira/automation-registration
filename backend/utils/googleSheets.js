const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const path = require("path");

const SPREADSHEET_ID = "1SxXNhOnld0SW_dTlbnD21Yq5vBW6XidzZX5LN9Z0uI4";
const KEYFILE_PATH = path.join(__dirname, "../credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

// Inisialisasi Google Sheets client
async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

/**
 * Simpan data baru (selalu append baris baru)
 */
async function appendToGoogleSheets(row) {
  const sheets = await getSheets();
  const values = [[
    row.id_perusahaan,
    row.nama_perusahaan,
    row.nomor_sumur,
    row.nomorRegistrasi,
    row.provinsi,
    row.kabupaten,
    row.kecamatan,
    row.desa,
    row.jenis,
    new Date().toISOString()
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:J",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values }
  });

  console.log("✅ Data berhasil ditambahkan ke Google Sheets");
}

/**
 * Update data berdasarkan id_perusahaan
 */
async function updateGoogleSheetsById(id_perusahaan, newRow) {
  const sheets = await getSheets();

  // Ambil semua data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:J",
  });

  const rows = res.data.values || [];
  let targetRow = -1;

  // Cari baris berdasarkan id_perusahaan di kolom A
  rows.forEach((r, idx) => {
    if (r[0] === id_perusahaan) {
      targetRow = idx + 1; // baris di sheet (1-based)
    }
  });

  if (targetRow === -1) {
    console.log("⚠️ Data tidak ditemukan di Google Sheets untuk update");
    return;
  }

  const values = [[
    newRow.id_perusahaan,
    newRow.nama_perusahaan,
    newRow.nomor_sumur,
    newRow.nomorRegistrasi,
    newRow.provinsi,
    newRow.kabupaten,
    newRow.kecamatan,
    newRow.desa,
    newRow.jenis,
    new Date().toISOString()
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${targetRow}:J${targetRow}`,
    valueInputOption: "RAW",
    requestBody: { values }
  });

  console.log("✅ Data berhasil diupdate di Google Sheets");
}

/**
 * Hapus data berdasarkan id_perusahaan
 */
async function deleteGoogleSheetsById(id_perusahaan) {
  const sheets = await getSheets();

  // Ambil semua data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:J",
  });

  const rows = res.data.values || [];
  let targetRow = -1;

  // Cari baris berdasarkan id_perusahaan
  rows.forEach((r, idx) => {
    if (r[0] === id_perusahaan) {
      targetRow = idx + 1;
    }
  });

  if (targetRow === -1) {
    console.log("⚠️ Data tidak ditemukan di Google Sheets untuk hapus");
    return;
  }

  // Clear isi baris (biar tidak geser data lain)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${targetRow}:J${targetRow}`,
  });

  console.log("✅ Data berhasil dihapus dari Google Sheets");
}

module.exports = {
  appendToGoogleSheets,
  updateGoogleSheetsById,
  deleteGoogleSheetsById,
};
