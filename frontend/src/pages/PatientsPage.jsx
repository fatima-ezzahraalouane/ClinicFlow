import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { request } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import PatientForm from '../components/PatientForm';

const PAGE_SIZE = 3;

export default function PatientsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: PAGE_SIZE });
    if (search) params.set('search', search);

    request(`/api/patients?${params}`)
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch(setError);
  }, [search, page, refreshKey]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleSaved() {
    setEditing(null);
    setRefreshKey(refreshKey + 1);
  }

  async function handleDelete(patient) {
    if (!window.confirm(`Delete ${patient.fullName}?`)) return;

    setError(null);
    try {
      await request(`/api/patients/${patient.id}`, { method: 'DELETE' });
      if (result.data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshKey(refreshKey + 1);
      }
    } catch (err) {
      setError(err);
    }
  }

  const totalPages = Math.max(result?.pagination.totalPages ?? 1, 1);

  return (
    <>
      <div className="toolbar">
        <h1>Patients</h1>
        {!editing && (
          <button className="button" onClick={() => setEditing('new')}>
            Add patient
          </button>
        )}
      </div>

      {editing && (
        <PatientForm
          key={editing === 'new' ? 'new' : editing.id}
          patient={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      <form className="search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search by full name or CIN"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="button" type="submit">
          Search
        </button>
      </form>

      <ErrorMessage error={error} />

      {!result ? (
        <p className="muted">Loading...</p>
      ) : result.data.length === 0 ? (
        <p className="muted">No patients found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Full name</th>
              <th>CIN</th>
              <th>Phone</th>
              <th>Birth date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <Link to={`/patients/${patient.id}`}>{patient.fullName}</Link>
                </td>
                <td>{patient.cin}</td>
                <td>{patient.phone}</td>
                <td>{patient.birthDate}</td>
                <td className="row-actions">
                  <button className="button secondary" onClick={() => setEditing(patient)}>
                    Edit
                  </button>
                  {user.role === 'admin' && (
                    <button className="button danger" onClick={() => handleDelete(patient)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {result && (
        <div className="pagination">
          <button className="button secondary" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages} ({result.pagination.total} patients)
          </span>
          <button className="button secondary" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
