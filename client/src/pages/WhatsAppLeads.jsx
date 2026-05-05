import React, { useEffect, useState } from 'react';
import Sidebar from "../components/dashboards/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WhatsAppLeads() {
  const [leads, setLeads] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await fetch(`${API_URL}/api/whatsappleads?${params.toString()}`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Fetch WhatsApp leads error', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">📲 WhatsApp Leads</h1>
            <p className="text-sm text-gray-500">Leads captured from WhatsApp (date-wise)</p>
          </div>
          <div className="flex gap-2 items-center">
            <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="px-3 py-2 border rounded" />
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="px-3 py-2 border rounded" />
            <button onClick={fetchLeads} className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          {loading ? (
            <div>Loading…</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No WhatsApp leads found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-600 uppercase">
                <tr>
                  <th className="p-2">Created</th>
                  <th className="p-2">Client ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Contact</th>
                  <th className="p-2">Service</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id} className="border-t">
                    <td className="p-2">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="p-2">{l.clientId}</td>
                    <td className="p-2">{l.elderName}</td>
                    <td className="p-2">{l.phone}</td>
                    <td className="p-2">{l.careType || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
