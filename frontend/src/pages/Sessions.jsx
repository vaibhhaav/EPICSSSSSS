import React, { useEffect, useState } from 'react';
import SessionScheduler from '../components/SessionScheduler.jsx';
import FeedbackForm from '../components/FeedbackForm.jsx';
import { listSessions } from '../services/api.js';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Sessions</h2>
        <p className="text-sm text-slate-600">
          Schedule and review video sessions between matched elders and children. Capture
          emotional feedback after each call.
        </p>
      </div>

      <SessionScheduler onScheduled={refresh} />

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800">Session History</h3>
          {loading && <span className="text-xs text-slate-500">Loading…</span>}
        </div>
        {error && (
          <p className="text-xs text-red-600 border border-red-200 bg-red-50 rounded-md px-2 py-1 mb-2">
            {error}
          </p>
        )}
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b">
                  When
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b">
                  Elder ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b">
                  Orphan ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b">
                  Link
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {new Date(s.scheduled_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">{s.elder_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{s.orphan_id}</td>
                  <td className="px-3 py-2 text-xs">
                    <a
                      href={s.video_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Open call
                    </a>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedSession(s)}
                      className="inline-flex items-center px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Add feedback
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-xs text-slate-500 text-center"
                  >
                    No sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSession && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-800">Post-session Feedback</h3>
            <button
              type="button"
              onClick={() => setSelectedSession(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Session on {new Date(selectedSession.scheduled_at).toLocaleString()} •{' '}
            <span className="font-medium">Elder:</span> {selectedSession.elder_id} •{' '}
            <span className="font-medium">Orphan:</span> {selectedSession.orphan_id}
          </p>
          <FeedbackForm
            session={selectedSession}
            onSubmitted={() => {
              setSelectedSession(null);
            }}
          />
        </section>
      )}
    </div>
  );
};

export default Sessions;

