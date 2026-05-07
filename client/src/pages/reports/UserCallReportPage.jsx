import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import UserCallReport from '../../components/calls/Usercallreport';
import Sidebar from '../../components/dashboards/Sidebar';

export default function UserCallReportPage() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const [agentsRes, callsRes] = await Promise.all([
          API.get('/agents'),
          API.get('/calls')
        ]);
        setAgents(agentsRes.data?.data || agentsRes.data || []);
        setCalls(callsRes.data?.data || callsRes.data || []);
      } catch (err) {
        console.error('Failed to load data for call report', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const navigate = useNavigate();

  if (loading) return <div className="p-8">Loading report...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white border-b border-slate-100 px-6 py-4 mb-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/reports')} className="px-3 py-2 rounded-lg border bg-white text-sm font-bold">← Back</button>
                  <h2 className="text-lg font-black">User Call Report</h2>
                </div>
                <div className="text-sm text-slate-500">Calls · per-agent summary</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <UserCallReport agents={agents} calls={calls} onClose={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
