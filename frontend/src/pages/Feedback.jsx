import React, { useEffect, useMemo, useState } from 'react';
import FeedbackTable from '../components/FeedbackTable.jsx';
import { getFeedback, getSessions, submitFeedback } from '../services/api.js';

const reconnectOptions = ['yes', 'no', 'maybe'];
const emotionOptions = ['happy', 'neutral', 'sad'];

export default function Feedback() {
  const [sessions, setSessions] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sessionId: '',
    emotion: 'happy',
    engagementScore: '',
    reconnect: 'yes',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsData, feedbackData] = await Promise.all([getSessions(), getFeedback()]);
      setSessions(sessionsData);
      setFeedbackItems(feedbackData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === 'completed'),
    [sessions],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const score = Number(form.engagementScore);
    if (!form.sessionId || Number.isNaN(score) || score < 0 || score > 1) {
      setError('Select completed session and set engagement score between 0 and 1.');
      return;
    }

    const selected = completedSessions.find((session) => session.id === form.sessionId);
    if (!selected) {
      setError('Feedback is allowed only for completed sessions.');
      return;
    }

    setSaving(true);
    try {
      await submitFeedback({
        sessionId: form.sessionId,
        emotion: form.emotion,
        engagementScore: score,
        reconnect: form.reconnect,
      });
      setForm({ sessionId: '', emotion: 'happy', engagementScore: '', reconnect: 'yes' });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Feedback</h2>
        <p className="text-sm text-slate-600">Submit post-session outcomes for completed sessions.</p>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-indigo-100 bg-white p-4 md:grid-cols-4" onSubmit={handleSubmit}>
        <select name="sessionId" value={form.sessionId} onChange={handleChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Select completed session</option>
          {completedSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.id}
            </option>
          ))}
        </select>

        <select name="emotion" value={form.emotion} onChange={handleChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {emotionOptions.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="engagementScore"
          min="0"
          max="1"
          step="0.01"
          value={form.engagementScore}
          onChange={handleChange}
          placeholder="Engagement score (0-1)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select name="reconnect" value={form.reconnect} onChange={handleChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {reconnectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="md:col-span-4 flex items-center justify-between">
          {error ? <p className="text-sm text-rose-600">{error}</p> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>

      {loading && <p className="text-sm text-slate-500">Loading feedback...</p>}

      <FeedbackTable feedbackItems={feedbackItems} />
    </section>
  );
}
