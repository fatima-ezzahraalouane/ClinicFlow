import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { request } from '../api/client';
import { STATUS_LABELS } from '../api/labels';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function PatientDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    request(`/api/patients/${id}`)
      .then(setPatient)
      .catch(setError);
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Supprimer ${patient.fullName} ?`)) return;

    setError(null);
    try {
      await request(`/api/patients/${id}`, { method: 'DELETE' });
      navigate('/patients');
    } catch (err) {
      setError(err);
    }
  }

  if (!patient) {
    return (
      <>
        <Link to="/patients">&larr; Retour aux patients</Link>
        {error ? <ErrorMessage error={error} /> : <p className="muted">Chargement...</p>}
      </>
    );
  }

  return (
    <>
      <Link to="/patients">&larr; Retour aux patients</Link>

      <div className="toolbar">
        <h1>{patient.fullName}</h1>
        {user.role === 'admin' && (
          <button className="button danger" onClick={handleDelete}>
            Supprimer le patient
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      <dl className="card details">
        <dt>CIN</dt>
        <dd>{patient.cin}</dd>
        <dt>Téléphone</dt>
        <dd>{patient.phone}</dd>
        <dt>Date de naissance</dt>
        <dd>{patient.birthDate}</dd>
        <dt>Adresse</dt>
        <dd>{patient.address || '-'}</dd>
      </dl>

      <h2>Rendez-vous</h2>
      {patient.appointments.length === 0 ? (
        <p className="muted">Aucun rendez-vous.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Statut</th>
              <th>Motif</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {patient.appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.appointmentDate.slice(0, 16)}</td>
                <td>
                  <span className={`badge ${appointment.status}`}>{STATUS_LABELS[appointment.status]}</span>
                </td>
                <td>{appointment.reason}</td>
                <td>{appointment.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
