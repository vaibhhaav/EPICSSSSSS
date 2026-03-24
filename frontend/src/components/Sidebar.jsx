import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../utils/auth.js';

const links = [
  { to: '/dashboard/profiles', label: 'Profiles' },
  { to: '/dashboard/matching', label: 'Matching' },
  { to: '/dashboard/connections', label: 'Connections' },
  { to: '/dashboard/sessions', label: 'Sessions' },
  { to: '/dashboard/feedback', label: 'Feedback' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-indigo-100 p-4 md:min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-indigo-700">Kindred Connect</h1>
        <p className="text-xs text-slate-500">Lifecycle Console</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-indigo-100 text-indigo-800 font-medium'
                  : 'text-slate-700 hover:bg-indigo-50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Logout
      </button>
    </aside>
  );
}
