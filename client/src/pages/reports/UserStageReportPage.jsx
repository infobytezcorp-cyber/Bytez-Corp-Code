import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../../components/dashboards/Sidebar';
import API from '../../services/api';
import * as XLSX from 'xlsx';

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function UserStageReportPage() {
  const [agents, setAgents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return formatDate(d);
  });
  const [toDate, setToDate] = useState(() => formatDate(new Date()));

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [agentsRes, enquiriesRes] = await Promise.all([
          API.get('/agents'),
          API.get('/enquiries', { params: { fromDate, toDate } }),
        ]);
        setAgents(agentsRes.data?.data || agentsRes.data || []);
        setEnquiries(enquiriesRes.data || []);
      } catch (err) {
        console.error('Failed to load user stage report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [fromDate, toDate]);

  const rows = useMemo(() => {
    return agents.map((agent) => {
      const assigned = enquiries.filter(e => {
        const id = e.assignedTo?._id || e.assignedTo;
        return id && String(id) === String(agent._id);
      });

      const totalAssigned = assigned.length;
      const newLeads = assigned.filter(e => {
        const created = new Date(e.createdAt);
        const from = new Date(fromDate); from.setHours(0,0,0,0);
        const to = new Date(toDate); to.setHours(23,59,59,999);
        return created >= from && created <= to;
      }).length;

      const callbacks = assigned.filter(e => (e.timeline || []).some(t => {
        const s = (t.status || t.event || '').toString().toLowerCase();
        return s.includes('call') || s.includes('callback') || s.includes('follow');
      })).length;

      const followUpDone = assigned.filter(e => (e.timeline || []).some(t => {
        const s = (t.status || t.event || '').toString().toLowerCase();
        return s.includes('done') || s.includes('completed') || s.includes('enrolled') || s.includes('converted');
      })).length;

      const converted = assigned.filter(e => {
        const stage = (e.stage || '').toString().toLowerCase();
        const task = (e.taskStatus || '').toString().toLowerCase();
        return stage.includes('convert') || stage.includes('enroll') || task.includes('converted') || task.includes('enrolled');
      }).length;

      const conversionRate = totalAssigned > 0 ? Math.round((converted / totalAssigned) * 10000) / 100 : 0;

      return {
        id: agent._id,
        name: agent.name || 'Unknown',
        manager: agent.manager || '',
        totalAssigned,
        newLeads,
        callbacks,
        followUpDone,
        converted,
        conversionRate,
      };
    }).sort((a,b) => b.totalAssigned - a.totalAssigned);
  }, [agents, enquiries, fromDate, toDate]);

  const downloadExcel = () => {
    const rowsForX = rows.map((r, i) => ({
      No: i + 1,
      'User Name': r.name,
      'Reporting Manager': r.manager || '',
      'Total Assigned Leads': r.totalAssigned,
      'New Lead': r.newLeads,
      'Callback': r.callbacks,
      'Follow up done': r.followUpDone,
      'Converted': r.converted,
      'Conversion %': r.conversionRate,
    }));
    const ws = XLSX.utils.json_to_sheet(rowsForX);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'User Stage');
    XLSX.writeFile(wb, `user-stage-report-${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">User Stage Report</h1>
                <p className="text-sm text-slate-500">Date range: {fromDate} — {toDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 rounded-md border" />
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 rounded-md border" />
                <button onClick={downloadExcel} className="px-4 py-2 bg-slate-900 text-white rounded-md">📥 Export</button>
              </div>
            </div>

            {loading ? <div className="p-8">Loading...</div> : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-auto">
                <table className="min-w-full table-fixed text-sm">
                  <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="w-12 px-4 py-3">No.</th>
                      <th className="px-4 py-3 text-left">User Name</th>
                      <th className="px-4 py-3 text-left">Reporting Manager</th>
                      <th className="px-4 py-3 text-right">Conversion %</th>
                      <th className="px-4 py-3 text-right">Total Assigned Leads</th>
                      <th className="px-4 py-3 text-right">New Lead</th>
                      <th className="px-4 py-3 text-right">Callback</th>
                      <th className="px-4 py-3 text-right">Follow up done</th>
                      <th className="px-4 py-3 text-right">Converted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.id} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3">{r.manager || '—'}</td>
                        <td className="px-4 py-3 text-right">{r.conversionRate}%</td>
                        <td className="px-4 py-3 text-right">{r.totalAssigned}</td>
                        <td className="px-4 py-3 text-right">{r.newLeads}</td>
                        <td className="px-4 py-3 text-right">{r.callbacks}</td>
                        <td className="px-4 py-3 text-right">{r.followUpDone}</td>
                        <td className="px-4 py-3 text-right">{r.converted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
