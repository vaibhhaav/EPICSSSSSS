import React, { useEffect, useState } from 'react';
import SessionModal from '../components/SessionModal.jsx';
import { getConnections, getSessions } from '../services/api.js';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsData, connectionsData] = await Promise.all([getSessions(), getConnections()]);
      setSessions(sessionsData);
      setConnections(connectionsData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedConnections = connections.filter((connection) => connection.status === 'approved');

  const schedule = async ({ connectionId, date, time }) => {
    const selected = approvedConnections.find((item) => item.id === connectionId);
    if (!selected) {
      setError('Only approved connections can be scheduled.');
      return;
    }
    setOpen(false);
    await loadData();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Sessions</h2>
          <p className="text-sm text-slate-600">Schedule sessions for approved connections only.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
        >
          Schedule Session
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading sessions...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white shadow-sm">
        <table className="min-w-[760px] w-full text-xs sm:text-sm">
          <thead className="bg-indigo-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">Orphan</th>
              <th className="px-3 py-2 text-left">Elder</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Meet Link</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-indigo-50">
                <td className="px-3 py-2">{session.orphanName || session.orphan?.name || '-'}</td>
                <td className="px-3 py-2">{session.elderName || session.elder?.name || '-'}</td>
                <td className="px-3 py-2">{session.date || '-'}</td>
                <td className="px-3 py-2">{session.time || '-'}</td>
                <td className="px-3 py-2">
                  {session.meetLink ? (
                    <a className="text-indigo-700 hover:underline" href={session.meetLink} target="_blank" rel="noreferrer">
                      Join
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-3 py-2 capitalize">{session.status || 'scheduled'}</td>
              </tr>
            ))}
            {!loading && sessions.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={6}>
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SessionModal
        open={open}
        approvedConnections={approvedConnections}
        onClose={() => setOpen(false)}
        onSubmit={schedule}
        loading={loading}
      />
    </section>
  );
}

