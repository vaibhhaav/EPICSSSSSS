import React, { useEffect, useMemo, useState } from 'react';
import MatchCard from '../components/MatchCard.jsx';
import { createMatch, generateMatches, getProfiles } from '../services/api.js';

export default function Matching() {
  const [profiles, setProfiles] = useState([]);
  const [orphanId, setOrphanId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profiles.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const orphans = useMemo(
    () => profiles.filter((profile) => (profile.institutionType || profile.type) === 'orphan'),
    [profiles],
  );

  const runMatching = async () => {
    if (!orphanId) {
      setError('Please select an orphan profile first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const generated = await generateMatches({ orphanId });
      setMatches(generated);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate matches.');
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (match) => {
    setCreatingId(match.elderId || match.id);
    setError('');
    try {
      await createMatch({
        orphanId,
        elderId: match.elderId || match.id,
        compatibilityScore: match.compatibilityScore,
        status: 'pending',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create connection.');
    } finally {
      setCreatingId('');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Matching</h2>
        <p className="text-sm text-slate-600">Generate ML-based elder matches for selected orphan profiles.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={orphanId}
          onChange={(event) => setOrphanId(event.target.value)}
          className="min-w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select orphan</option>
          {orphans.map((orphan) => (
            <option key={orphan.id} value={orphan.id}>
              {orphan.name || orphan.fullName || orphan.id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={runMatching}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Matches'}
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id || match.elderId}
            match={match}
            loading={creatingId === (match.elderId || match.id)}
            onCreateConnection={createConnection}
          />
        ))}
      </div>
    </section>
  );
}
