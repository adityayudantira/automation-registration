// Middleware handle error untuk duplicate key MongoDB
function handleMongoDuplicateKeyError(err, req, res, next) {
  if (err.code && err.code === 11000) {
    // Ambil field yang duplikat
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      message: `❌ ${field} sudah terdaftar`
    });
  }
  next(err); // teruskan error lain
}

module.exports = { handleMongoDuplicateKeyError };
