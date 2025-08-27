require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require("./routes/authRoutes");
const wilayahRoutes = require('./routes/wilayahRoutes');
const registrasiRoutes = require('./routes/registrasiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const { handleMongoDuplicateKeyError } = require("./middlewares/errorHandler");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use('/api/wilayah', wilayahRoutes);
app.use('/api/registrasi', registrasiRoutes);
app.use("/api/registrasi", require("./routes/registrasiRoutes"));

app.use(handleMongoDuplicateKeyError);

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'sumurdb',
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.error(err));
