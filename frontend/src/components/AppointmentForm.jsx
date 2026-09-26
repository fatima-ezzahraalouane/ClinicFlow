import { useEffect, useState } from 'react';
import { request } from '../api/client';
import ErrorMessage from './ErrorMessage';

export default function AppointmentForm({ onSaved, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [values, setValues] = useState({ patientId: '', appointmentDate: '', reason: '', notes: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    request('/api/patients?limit=100')
      .then((result) => setPatients(result.data))
      .catch(setError);
  }, []);

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await request('/api/appointments', { method: 'POST', body: values });
      onSaved();
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>New appointment</h2>

      <div className="form-grid">
        <label>
          Patient
          <select name="patientId" value={values.patientId} onChange={handleChange} required>
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} ({patient.cin})
              </option>
            ))}
          </select>
        </label>
        <label>
          Date and time
          <input
            type="datetime-local"
            name="appointmentDate"
            value={values.appointmentDate}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        Reason
        <input name="reason" value={values.reason} onChange={handleChange} maxLength={255} required />
      </label>
      <label>
        Notes (optional)
        <textarea name="notes" value={values.notes} onChange={handleChange} rows={3} />
      </label>

      <ErrorMessage error={error} />

      <div className="actions">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button className="button secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
