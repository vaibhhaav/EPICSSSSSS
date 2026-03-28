import React from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionSetup from '../components/InstitutionSetup.jsx';
import { useUser } from '../context/UserContext.jsx';

export default function DashboardHome() {
  const { loading, institutionId } = useUser();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-white p-8 text-center text-sm text-slate-600">
        Loading your account…
      </div>
    );
  }

  if (!institutionId) {
    return <InstitutionSetup />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Manage profiles for your organization. Institution setup is complete.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate('/dashboard/profiles')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Add Profile
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard/settings')}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go to Settings
        </button>
      </div>
    </section>
  );
}
