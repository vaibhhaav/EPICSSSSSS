import React from 'react';

export default function MatchCard({
  match,
  onCreateConnection,
  loading,
  showCreateConnection = true,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        highlight ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-indigo-100'
      }`}
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {match.elderName || match.elder?.name || `Elder #${match.elderId}`}
      </h3>
      <p className="mt-1 text-xs text-indigo-700">Compatibility: {match.compatibilityScore}</p>
      <p className="mt-2 text-xs text-slate-600">{match.reason || match.matchReason || 'No reason provided.'}</p>
      {showCreateConnection && typeof onCreateConnection === 'function' && (
        <button
          type="button"
          onClick={() => onCreateConnection(match)}
          disabled={loading}
          className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create Connection'}
        </button>
      )}
    </div>
  );
}
