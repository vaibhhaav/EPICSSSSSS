import React, { useMemo, useState } from 'react';

const interestOptions = ['music', 'art', 'stories', 'games', 'nature', 'reading'];
const communicationOptions = ['verbal', 'non-verbal', 'mixed'];
const emotionalStateOptions = ['calm', 'anxious', 'sad', 'happy', 'neutral'];
const attachmentOptions = ['secure', 'avoidant', 'ambivalent', 'disorganized'];
const availabilityOptions = ['morning', 'afternoon', 'evening'];

const initialForm = {
  name: '',
  age: '',
  personalityType: '',
  emotionalState: '',
  attachmentStyle: '',
  interests: [],
  communicationStyle: '',
  availability: '',
  traumaLevel: '',
  language: '',
  patienceLevel: '',
  healthCondition: '',
};

export default function ProfileForm({ open, type, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const isElder = type === 'elder';
  const title = useMemo(() => (isElder ? 'Add Elder Profile' : 'Add Orphan Profile'), [isElder]);

  if (!open) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateInterests = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setForm((prev) => ({ ...prev, interests: values }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const required = [
      'name',
      'age',
      'personalityType',
      'emotionalState',
      'attachmentStyle',
      'communicationStyle',
      'availability',
      'traumaLevel',
      'language',
    ];

    if (isElder) required.push('patienceLevel', 'healthCondition');

    const missing = required.some((key) => !String(form[key]).trim());
    if (missing || form.interests.length === 0) {
      setError('Please complete all fields.');
      return;
    }

    await onSubmit({ ...form, institutionType: type, age: Number(form.age) });
    setForm(initialForm);
  };

  const inputStyle = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={updateField} className={inputStyle} />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={updateField} className={inputStyle} />
          <input name="personalityType" placeholder="Personality Type" value={form.personalityType} onChange={updateField} className={inputStyle} />
          <select name="emotionalState" value={form.emotionalState} onChange={updateField} className={inputStyle}>
            <option value="">Emotional State</option>
            {emotionalStateOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="attachmentStyle" value={form.attachmentStyle} onChange={updateField} className={inputStyle}>
            <option value="">Attachment Style</option>
            {attachmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select multiple value={form.interests} onChange={updateInterests} className={`${inputStyle} h-24`} aria-label="Interests">
            {interestOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="communicationStyle" value={form.communicationStyle} onChange={updateField} className={inputStyle}>
            <option value="">Communication Style</option>
            {communicationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="availability" value={form.availability} onChange={updateField} className={inputStyle}>
            <option value="">Availability</option>
            {availabilityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <input name="traumaLevel" placeholder="Trauma Level" value={form.traumaLevel} onChange={updateField} className={inputStyle} />
          <input name="language" placeholder="Language" value={form.language} onChange={updateField} className={inputStyle} />
          {isElder && (
            <>
              <input name="patienceLevel" placeholder="Patience Level" value={form.patienceLevel} onChange={updateField} className={inputStyle} />
              <input name="healthCondition" placeholder="Health Condition" value={form.healthCondition} onChange={updateField} className={inputStyle} />
            </>
          )}
          {error && <p className="md:col-span-2 text-xs text-rose-600">{error}</p>}
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
