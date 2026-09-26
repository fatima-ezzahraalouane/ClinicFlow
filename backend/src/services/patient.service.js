const pool = require('../config/db');
const AppError = require('../utils/AppError');

const PATIENT_COLUMNS = `
  id, full_name AS "fullName", cin, phone, birth_date AS "birthDate",
  address, created_at AS "createdAt"`;

function rethrowCinConflict(err) {
  if (err.code === '23505' && err.constraint === 'patients_cin_key') {
    throw new AppError(409, 'Un patient avec ce CIN existe déjà');
  }
  throw err;
}

async function createPatient({ fullName, cin, phone, birthDate, address }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO patients (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PATIENT_COLUMNS}`,
      [fullName, cin, phone, birthDate, address]
    );
    return rows[0];
  } catch (err) {
    rethrowCinConflict(err);
  }
}

async function listPatients({ search, page, limit }) {
  const pattern = search ? `%${search}%` : null;
  const offset = (page - 1) * limit;
  const where = 'WHERE ($1::text IS NULL OR full_name ILIKE $1 OR cin ILIKE $1)';

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${PATIENT_COLUMNS} FROM patients ${where}
       ORDER BY full_name, id
       LIMIT $2 OFFSET $3`,
      [pattern, limit, offset]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM patients ${where}`, [pattern]),
  ]);

  const total = countResult.rows[0].total;

  return {
    data: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getPatientById(id) {
  const { rows } = await pool.query(`SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = $1`, [id]);

  if (rows.length === 0) {
    throw new AppError(404, 'Patient introuvable');
  }

  const appointments = await pool.query(
    `SELECT id, appointment_date AS "appointmentDate", status, reason, notes,
            created_by AS "createdBy", created_at AS "createdAt"
     FROM appointments
     WHERE patient_id = $1
     ORDER BY appointment_date DESC`,
    [id]
  );

  return { ...rows[0], appointments: appointments.rows };
}

async function updatePatient(id, { fullName, cin, phone, birthDate, address }) {
  try {
    const { rows } = await pool.query(
      `UPDATE patients
       SET full_name = $1, cin = $2, phone = $3, birth_date = $4, address = $5
       WHERE id = $6
       RETURNING ${PATIENT_COLUMNS}`,
      [fullName, cin, phone, birthDate, address, id]
    );

    if (rows.length === 0) {
      throw new AppError(404, 'Patient introuvable');
    }
    return rows[0];
  } catch (err) {
    rethrowCinConflict(err);
  }
}

async function deletePatient(id) {
  try {
    const { rowCount } = await pool.query('DELETE FROM patients WHERE id = $1', [id]);

    if (rowCount === 0) {
      throw new AppError(404, 'Patient introuvable');
    }
  } catch (err) {
    if (err.code === '23001') {
      throw new AppError(409, 'Impossible de supprimer ce patient : il a encore des rendez-vous');
    }
    throw err;
  }
}

module.exports = { createPatient, listPatients, getPatientById, updatePatient, deletePatient };
