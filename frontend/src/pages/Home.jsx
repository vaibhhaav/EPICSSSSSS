import React from 'react';
import { useNavigate } from 'react-router-dom';

const options = [
  { key: 'orphanage', label: 'Orphanage' },
  { key: 'elder-care-home', label: 'Elder Care Home' },
];

export default function Home() {
  const navigate = useNavigate();

  const selectInstitution = (institutionType) => {
    localStorage.setItem('institutionType', institutionType);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-indigo-800">Kindred Connect</h1>
        <p className="mt-2 text-slate-600">Choose institution type to continue.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => selectInstitution(option.key)}
              className="rounded-2xl border border-indigo-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-indigo-700">{option.label}</h2>
              <p className="mt-2 text-sm text-slate-500">Proceed to secure login for {option.label}.</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
