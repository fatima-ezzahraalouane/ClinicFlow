import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { request } from '../api/client';
import { STATUSES, STATUS_LABELS } from '../api/labels';
import ErrorMessage from '../components/ErrorMessage';
import AppointmentForm from '../components/AppointmentForm';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (status) params.set('status', status);

    request(`/api/appointments?${params}`)
      .then((data) => {
        setAppointments(data);
        setError(null);
      })
      .catch(setError);
  }, [date, status, refreshKey]);

  function handleSaved() {
    setShowForm(false);
    setRefreshKey(refreshKey + 1);
  }

  async function handleStatusChange(appointment, newStatus) {
    setError(null);
    try {
      await request(`/api/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setRefreshKey(refreshKey + 1);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <div className="toolbar">
        <h1>Rendez-vous</h1>
        {!showForm && (
          <button className="button" onClick={() => setShowForm(true)}>
            Nouveau rendez-vous
          </button>
        )}
      </div>

      {showForm && <AppointmentForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />}

      <div className="filters">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Statut
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        {(date || status) && (
          <button
            className="button secondary"
            onClick={() => {
              setDate('');
              setStatus('');
            }}
          >
            Effacer les filtres
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      {!appointments ? (
        <p className="muted">Chargement...</p>
      ) : appointments.length === 0 ? (
        <p className="muted">Aucun rendez-vous trouvé.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Motif</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.appointmentDate.slice(0, 16)}</td>
                <td>
                  <Link to={`/patients/${appointment.patientId}`}>{appointment.patientName}</Link>
                </td>
                <td>{appointment.reason}</td>
                <td>
                  <select
                    className={`badge ${appointment.status}`}
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment, e.target.value)}
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
