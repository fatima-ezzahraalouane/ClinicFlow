const express = require('express');
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const validate = require('../middlewares/validate');
const { patientSchema } = require('../validators/patient.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(patientSchema), patientController.create);
router.get('/', patientController.list);
router.get('/:id', patientController.getById);
router.put('/:id', validate(patientSchema), patientController.update);
router.delete('/:id', requireRole('admin'), patientController.remove);

module.exports = router;
