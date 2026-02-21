import React, { useState } from 'react';

const emptyState = {
  type: 'elder',
  name: '',
  age: '',
  gender: '',
  languages: '',
  hobbies: '',
  emotional_needs: '',
  institution: '',
};

const ProfileForm = ({ onSubmit }) => {
  const [form, setForm] = useState(emptyState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ageNum = Number(form.age);
      const payload = {
        type: form.type,
        name: form.name.trim(),
        age: Number.isNaN(ageNum) ? 0 : ageNum,
        gender: form.gender.trim(),
        languages: (form.languages || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        hobbies: (form.hobbies || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        emotional_needs: (form.emotional_needs || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        institution: form.institution.trim(),
      };
      await onSubmit(payload);
      setForm(emptyState);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="block text-slate-700 font-medium">Type</span>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="elder">Elder</option>
            <option value="orphan">Orphan</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-slate-700 font-medium">Age</span>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
            required
            min={1}
          />
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">Name</span>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </label>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">Gender</span>
        <input
          type="text"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </label>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">
          Languages (comma-separated)
        </span>
        <input
          type="text"
          name="languages"
          value={form.languages}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="English, Hindi"
        />
      </label>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">
          Hobbies (comma-separated)
        </span>
        <input
          type="text"
          name="hobbies"
          value={form.hobbies}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Reading, Music"
        />
      </label>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">
          Emotional needs (comma-separated)
        </span>
        <input
          type="text"
          name="emotional_needs"
          value={form.emotional_needs}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Companionship, Encouragement"
        />
      </label>
      <label className="space-y-1 block">
        <span className="block text-slate-700 font-medium">Institution</span>
        <input
          type="text"
          name="institution"
          value={form.institution}
          onChange={handleChange}
          className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </label>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300"
        >
          {submitting ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;

