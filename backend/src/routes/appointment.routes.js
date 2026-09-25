const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createAppointmentSchema,
  updateStatusSchema,
} = require('../validators/appointment.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createAppointmentSchema), appointmentController.create);
router.get('/', appointmentController.list);
router.patch('/:id/status', validate(updateStatusSchema), appointmentController.updateStatus);

module.exports = router;
