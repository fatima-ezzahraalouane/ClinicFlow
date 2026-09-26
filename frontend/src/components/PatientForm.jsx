import { useState } from 'react';
import { request } from '../api/client';
import ErrorMessage from './ErrorMessage';

export default function PatientForm({ patient, onSaved, onCancel }) {
  const [values, setValues] = useState({
    fullName: patient?.fullName ?? '',
    cin: patient?.cin ?? '',
    phone: patient?.phone ?? '',
    birthDate: patient?.birthDate ?? '',
    address: patient?.address ?? '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (patient) {
        await request(`/api/patients/${patient.id}`, { method: 'PUT', body: values });
      } else {
        await request('/api/patients', { method: 'POST', body: values });
      }
      onSaved();
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{patient ? 'Modifier le patient' : 'Nouveau patient'}</h2>

      <div className="form-grid">
        <label>
          Nom complet
          <input name="fullName" value={values.fullName} onChange={handleChange} maxLength={150} required />
        </label>
        <label>
          CIN
          <input name="cin" value={values.cin} onChange={handleChange} maxLength={20} required />
        </label>
        <label>
          Téléphone
          <input name="phone" value={values.phone} onChange={handleChange} maxLength={20} required />
        </label>
        <label>
          Date de naissance
          <input type="date" name="birthDate" value={values.birthDate} onChange={handleChange} required />
        </label>
      </div>

      <label>
        Adresse (optionnel)
        <input name="address" value={values.address} onChange={handleChange} />
      </label>

      <ErrorMessage error={error} />

      <div className="actions">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button className="button secondary" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
