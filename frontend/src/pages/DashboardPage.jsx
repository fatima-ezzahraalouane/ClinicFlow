import { useEffect, useState } from 'react';
import { request } from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/api/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="muted">Loading...</p>;

  const cards = [
    { label: 'Total patients', value: stats.totalPatients },
    { label: "Today's appointments", value: stats.todayAppointments },
    { label: 'Pending', value: stats.pendingCount },
    { label: 'Confirmed', value: stats.confirmedCount },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        {cards.map((card) => (
          <div key={card.label} className="card stat">
            <span className="stat-value">{card.value}</span>
            <span className="muted">{card.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
