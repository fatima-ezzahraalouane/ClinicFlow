const patientService = require('../services/patient.service');
const { listPatientsQuerySchema } = require('../validators/patient.validator');
const { idParamSchema } = require('../validators/common.validator');

async function create(req, res) {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json(patient);
}

async function list(req, res) {
  const query = listPatientsQuerySchema.parse(req.query);
  const result = await patientService.listPatients(query);
  res.json(result);
}

async function getById(req, res) {
  const { id } = idParamSchema.parse(req.params);
  const patient = await patientService.getPatientById(id);
  res.json(patient);
}

async function update(req, res) {
  const { id } = idParamSchema.parse(req.params);
  const patient = await patientService.updatePatient(id, req.body);
  res.json(patient);
}

async function remove(req, res) {
  const { id } = idParamSchema.parse(req.params);
  await patientService.deletePatient(id);
  res.status(204).end();
}

module.exports = { create, list, getById, update, remove };
