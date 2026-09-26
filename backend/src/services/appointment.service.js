const pool = require('../config/db');
const AppError = require('../utils/AppError');

const APPOINTMENT_COLUMNS = `
  id, patient_id AS "patientId", appointment_date AS "appointmentDate", status,
  reason, notes, created_by AS "createdBy", created_at AS "createdAt"`;

async function createAppointment({ patientId, appointmentDate, reason, notes }, userId) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING ${APPOINTMENT_COLUMNS}`,
      [patientId, appointmentDate, reason, notes, userId]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23503' && err.constraint === 'appointments_patient_id_fkey') {
      throw new AppError(404, 'Patient introuvable');
    }
    throw err;
  }
}

async function listAppointments({ date, status }) {
  const { rows } = await pool.query(
    `SELECT a.id, a.patient_id AS "patientId", p.full_name AS "patientName", p.cin AS "patientCin",
            a.appointment_date AS "appointmentDate", a.status, a.reason, a.notes,
            a.created_by AS "createdBy", a.created_at AS "createdAt"
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE ($1::date IS NULL OR (a.appointment_date >= $1::date AND a.appointment_date < $1::date + 1))
       AND ($2::text IS NULL OR a.status = $2)
     ORDER BY a.appointment_date`,
    [date ?? null, status ?? null]
  );
  return rows;
}

async function hasConfirmedConflict(patientId, appointmentDate, appointmentId) {
  const { rows } = await pool.query(
    `SELECT id FROM appointments
     WHERE patient_id = $1
       AND status = 'confirmed'
       AND appointment_date BETWEEN ($2::timestamp - interval '30 minutes')
                                AND ($2::timestamp + interval '30 minutes')
       AND id <> $3
     LIMIT 1`,
    [patientId, appointmentDate, appointmentId]
  );
  return rows.length > 0;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    'SELECT id, patient_id, appointment_date FROM appointments WHERE id = $1',
    [id]
  );
  const appointment = rows[0];

  if (!appointment) {
    throw new AppError(404, 'Rendez-vous introuvable');
  }

  if (
    status === 'confirmed' &&
    (await hasConfirmedConflict(appointment.patient_id, appointment.appointment_date, id))
  ) {
    throw new AppError(400, "Ce patient a déjà un rendez-vous confirmé à moins de 30 minutes d'intervalle");
  }

  const updated = await pool.query(
    `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING ${APPOINTMENT_COLUMNS}`,
    [status, id]
  );
  return updated.rows[0];
}

module.exports = { createAppointment, listAppointments, updateStatus };
