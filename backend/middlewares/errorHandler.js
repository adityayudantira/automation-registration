// middlewares/errorHandler.js

export function handleMongoDuplicateKeyError(err, req, res, next) {
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      message: `❌ ${field} sudah terdaftar`
    });
  }
  next(err);
}
