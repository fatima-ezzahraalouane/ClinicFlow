const appointmentService = require('../services/appointment.service');
const { listAppointmentsQuerySchema } = require('../validators/appointment.validator');
const { idParamSchema } = require('../validators/common.validator');

async function create(req, res) {
  const appointment = await appointmentService.createAppointment(req.body, req.user.id);
  res.status(201).json(appointment);
}

async function list(req, res) {
  const filters = listAppointmentsQuerySchema.parse(req.query);
  const appointments = await appointmentService.listAppointments(filters);
  res.json(appointments);
}

async function updateStatus(req, res) {
  const { id } = idParamSchema.parse(req.params);
  const appointment = await appointmentService.updateStatus(id, req.body.status);
  res.json(appointment);
}

module.exports = { create, list, updateStatus };
