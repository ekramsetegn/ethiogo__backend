const express = require('express');
const router = express.Router();
const { getAllBuses, addBus, deleteBus, updateBus } = require('../controllers/busController');

router.get('/', getAllBuses);
router.post('/', addBus);
router.delete('/:id', deleteBus);
router.put('/:id', updateBus);

module.exports = router;
