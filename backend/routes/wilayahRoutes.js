const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayahController');

router.get('/provinsi', wilayahController.getProvinsi);
router.get('/kabupaten/:kodeProvinsi', wilayahController.getKabupaten);
router.get('/kecamatan/:kodeKabupaten', wilayahController.getKecamatan);
router.get('/kelurahan/:kodeKecamatan', wilayahController.getKelurahan);

module.exports = router;
