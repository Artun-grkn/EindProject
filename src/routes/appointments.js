const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { createAppointment, listAppointments, updateAppointment } = require('../controllers/appointmentsController');

router.post('/', verifyToken, createAppointment); // klant boekt
router.get('/', verifyToken, listAppointments);   // admin of gebruiker (controller check)
router.put('/:id', verifyToken, updateAppointment); // admin kan status wijzigen

module.exports = router;
