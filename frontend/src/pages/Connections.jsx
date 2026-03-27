import React, { useEffect, useState } from 'react';
import ConnectionTable from '../components/ConnectionTable.jsx';
import { getConnections, updateConnectionStatus } from '../services/api.js';

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState('');
  const [error, setError] = useState('');

  const loadConnections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getConnections();
      setConnections(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch connections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const onUpdateStatus = async (id, status) => {
    const connection = connections.find((item) => item.id === id);
    if (!connection || connection.status !== 'pending') return;

    setProcessingId(id);
    setError('');
    try {
      await updateConnectionStatus(id, { status });
      await loadConnections();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setProcessingId('');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Connections</h2>
        <p className="text-sm text-slate-600">Approve or reject pending matches in the lifecycle workflow.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading connections...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <ConnectionTable
        connections={connections}
        processingId={processingId}
        onUpdateStatus={onUpdateStatus}
      />
    </section>
  );
}
