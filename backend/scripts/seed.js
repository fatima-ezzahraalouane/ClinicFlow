// Seed script: 1 admin, 2 staff, 5 patients, 10 appointments.
// This is the ONLY place in the project where a role is assigned to a user.
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const SALT_ROUNDS = 10;

const users = [
  { fullName: 'Admin ClinicFlow', email: 'admin@clinicflow.com', password: 'Admin123!', role: 'admin' },
  { fullName: 'Sara Bennani', email: 'sara@clinicflow.com', password: 'Staff123!', role: 'staff' },
  { fullName: 'Karim Tazi', email: 'karim@clinicflow.com', password: 'Staff123!', role: 'staff' },
];

const patients = [
  { fullName: 'Youssef El Amrani', cin: 'AB123456', phone: '0612345678', birthDate: '1985-03-12', address: '12 Rue Atlas, Casablanca' },
  { fullName: 'Fatima Zahra Idrissi', cin: 'CD234567', phone: '0623456789', birthDate: '1992-07-25', address: '8 Avenue Hassan II, Rabat' },
  { fullName: 'Mohamed Alaoui', cin: 'EF345678', phone: '0634567890', birthDate: '1978-11-03', address: null },
  { fullName: 'Khadija Berrada', cin: 'GH456789', phone: '0645678901', birthDate: '2001-01-18', address: '45 Boulevard Zerktouni, Marrakech' },
  { fullName: 'Omar Chraibi', cin: 'IJ567890', phone: '0656789012', birthDate: '1966-09-30', address: '3 Rue de Fès, Tanger' },
];

const appointments = [
  { patient: 0, offset: '0 days 09:00', status: 'confirmed', reason: 'Consultation générale', notes: null, createdBy: 1 },
  { patient: 0, offset: '0 days 09:15', status: 'pending', reason: 'Contrôle tension', notes: 'Démo règle des 30 minutes', createdBy: 1 },
  { patient: 1, offset: '0 days 10:00', status: 'pending', reason: 'Suivi grossesse', notes: null, createdBy: 2 },
  { patient: 2, offset: '0 days 11:30', status: 'confirmed', reason: 'Douleurs dorsales', notes: null, createdBy: 0 },
  { patient: 0, offset: '-1 days 14:00', status: 'confirmed', reason: 'Résultats analyses', notes: null, createdBy: 2 },
  { patient: 3, offset: '-2 days 09:30', status: 'cancelled', reason: 'Vaccination', notes: 'Annulé par le patient', createdBy: 1 },
  { patient: 4, offset: '-3 days 16:00', status: 'confirmed', reason: 'Bilan annuel', notes: null, createdBy: 0 },
  { patient: 1, offset: '1 days 10:00', status: 'pending', reason: 'Échographie', notes: null, createdBy: 2 },
  { patient: 4, offset: '1 days 15:00', status: 'cancelled', reason: 'Consultation cardiologie', notes: null, createdBy: 1 },
  { patient: 3, offset: '2 days 11:00', status: 'pending', reason: 'Renouvellement ordonnance', notes: null, createdBy: 2 },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM appointments');
    await client.query('DELETE FROM patients');
    await client.query('DELETE FROM users');

    const userIds = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const { rows } = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [u.fullName, u.email, passwordHash, u.role]
      );
      userIds.push(rows[0].id);
    }

    const patientIds = [];
    for (const p of patients) {
      const { rows } = await client.query(
        `INSERT INTO patients (full_name, cin, phone, birth_date, address)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [p.fullName, p.cin, p.phone, p.birthDate, p.address]
      );
      patientIds.push(rows[0].id);
    }

    for (const a of appointments) {
      await client.query(
        `INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
         VALUES ($1, CURRENT_DATE + $2::interval, $3, $4, $5, $6)`,
        [patientIds[a.patient], a.offset, a.status, a.reason, a.notes, userIds[a.createdBy]]
      );
    }

    await client.query('COMMIT');

    console.log(`Seed done: ${users.length} users, ${patients.length} patients, ${appointments.length} appointments`);
    console.log('Login credentials:');
    users.forEach((u) => console.log(`  ${u.role.padEnd(5)}  ${u.email}  /  ${u.password}`));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, nothing was written:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
