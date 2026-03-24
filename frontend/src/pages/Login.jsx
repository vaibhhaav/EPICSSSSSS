import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-indigo-100 p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Kindred Connect</h1>
        <p className="text-sm text-slate-500 mb-4">Sign in to continue to the workflow dashboard.</p>

        {error && (
          <p className="mb-3 text-xs text-red-600 border border-red-200 bg-red-50 rounded-md px-2 py-1">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <label className="space-y-1 block">
            <span className="block text-slate-700 font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border-slate-300"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-slate-700 font-medium">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border-slate-300"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

