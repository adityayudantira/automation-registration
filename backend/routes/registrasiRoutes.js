const express = require('express');
const router = express.Router();
const registrasiController = require('../controllers/registrasiController');
const { getAllSumur } = require('../controllers/registrasiController');

router.post('/', registrasiController.registrasiSumur);
router.post('/nama-fuzzy', registrasiController.registrasiNamaFuzzy);
router.post('/saran-wilayah', registrasiController.getSaranWilayah);
//router.get('/', getAllSumur);
router.get("/", registrasiController.getAllSumur);
router.delete('/:id', registrasiController.deleteSumur);
router.patch("/:id", registrasiController.updateSumur);


module.exports = router;
