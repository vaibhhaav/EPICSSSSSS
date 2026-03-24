import React, { useEffect, useMemo, useState } from 'react';
import ProfileForm from '../components/ProfileForm.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import { createProfile, getProfiles } from '../services/api.js';

export default function Profiles() {
  const [tab, setTab] = useState('orphan');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const filteredProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        const role = profile.institutionType || profile.type || profile.role;
        return tab === 'orphan' ? role === 'orphan' : role === 'elder';
      }),
    [profiles, tab],
  );

  const submitProfile = async (payload) => {
    setSaving(true);
    setError('');
    try {
      await createProfile(payload);
      setFormOpen(false);
      await loadProfiles();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Profiles</h2>
          <p className="text-sm text-slate-600">Manage orphan and elder profile records.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Add Profile
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('orphan')}
          className={`rounded-lg px-3 py-2 text-sm ${tab === 'orphan' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          Orphans
        </button>
        <button
          type="button"
          onClick={() => setTab('elder')}
          className={`rounded-lg px-3 py-2 text-sm ${tab === 'elder' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          Elders
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading profiles...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredProfiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
        {!loading && filteredProfiles.length === 0 && (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-white p-6 text-sm text-slate-500">
            No profiles found for this tab.
          </div>
        )}
      </div>

      <ProfileForm
        open={formOpen}
        type={tab}
        onClose={() => setFormOpen(false)}
        onSubmit={submitProfile}
        loading={saving}
      />
    </section>
  );
}
