import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase.js';

export default function SessionModal({ open, approvedConnections, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ connectionId: '', date: '', time: '' });
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.connectionId || !form.date || !form.time) {
      setError('All fields are required.');
      alert('Please complete all required fields');
      return;
    }

    const formData = {
      connectionId: String(form.connectionId).trim(),
      date: String(form.date).trim(),
      time: String(form.time).trim(),
    };

    console.log('Submitting:', formData);

    try {
      await addDoc(collection(db, 'sessions'), {
        ...formData,
        status: 'scheduled',
        createdAt: new Date(),
      });
      await onSubmit?.(formData);
      console.log('Saved successfully');
      alert('Data added successfully');
      setForm({ connectionId: '', date: '', time: '' });
    } catch (saveError) {
      console.error(saveError);
      alert('Error saving data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 sm:p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Schedule Session</h3>
        <p className="mt-1 text-xs text-slate-500">Only approved connections are available.</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <select
            name="connectionId"
            value={form.connectionId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select approved connection</option>
            {approvedConnections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {(connection.orphanName || connection.orphan?.name || 'Orphan')} -{' '}
                {(connection.elderName || connection.elder?.name || 'Elder')}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
