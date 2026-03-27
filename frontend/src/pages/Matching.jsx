import React, { useEffect, useMemo, useState } from 'react';
import MatchCard from '../components/MatchCard.jsx';
import { autoMatchAll, createMatch, generateMatches, getProfiles } from '../services/api.js';

export default function Matching() {
  const [profiles, setProfiles] = useState([]);
  const [orphanId, setOrphanId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState('');
  const [error, setError] = useState('');
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [autoMatched, setAutoMatched] = useState(false);
  const [highlightMatchIds, setHighlightMatchIds] = useState([]);

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
    setSuccessMessage('');
    setAutoMatched(false);
    setHighlightMatchIds([]);
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

  const runAutoMatchAll = async () => {
    const confirmed = window.confirm(
      'Auto Match All will pair elders with the best available orphans and create active connections. Continue?',
    );
    if (!confirmed) return;

    setError('');
    setSuccessMessage('');
    setAutoMatched(false);
    setHighlightMatchIds([]);
    setAutoMatchLoading(true);

    try {
      const result = await autoMatchAll();
      const created = result?.matches || [];
      const createdCount = Number(result?.createdCount ?? created.length);
      if (createdCount > 0) {
        setMatches(created);
        setHighlightMatchIds(created.map((m) => m.id).filter(Boolean));
        setAutoMatched(true);
        setSuccessMessage('All profiles matched successfully');
      } else {
        setAutoMatched(false);
        setHighlightMatchIds([]);
        setMatches([]);
        setError(result?.error || 'No orphans available to match.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Auto match failed.');
    } finally {
      setAutoMatchLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Matching</h2>
        <p className="text-sm text-slate-600">Generate ML-based elder matches for selected orphan profiles.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runAutoMatchAll}
          disabled={autoMatchLoading || loading}
          className="auto-match-btn"
        >
          {autoMatchLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Matching...
            </span>
          ) : (
            'Auto Match All'
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={orphanId}
          onChange={(event) => setOrphanId(event.target.value)}
          className="w-full sm:w-auto sm:min-w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
      {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id || match.elderId}
            match={match}
            loading={creatingId === (match.elderId || match.id)}
            onCreateConnection={createConnection}
            showCreateConnection={!autoMatched}
            highlight={autoMatched && highlightMatchIds.includes(match.id)}
          />
        ))}
      </div>
    </section>
  );
}
