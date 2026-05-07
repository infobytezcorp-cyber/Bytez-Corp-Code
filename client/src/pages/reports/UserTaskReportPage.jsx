import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboards/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normalizePhone = (v = '') => String(v).replace(/\D/g, '').replace(/^91/, '');

export default function UserTaskReportPage() {
  const [tasks, setTasks] = useState([]);
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const taskReportList = useSelector((s) => s.taskReport?.list || []);

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        const [eRes, cRes, aRes] = await Promise.all([
          axios.get(`${API_URL}/api/enquiries`),
          axios.get(`${API_URL}/api/calls`),
          axios.get(`${API_URL}/api/agents`),
        ]);

        if (!mounted) return;
        const enquiries = Array.isArray(eRes.data) ? eRes.data : (eRes.data.data || []);
        const callsResp = Array.isArray(cRes.data) ? cRes.data : (cRes.data.data || []);
        const agentsResp = Array.isArray(aRes.data) ? aRes.data : (aRes.data.data || []);

        setTasks(enquiries);
        setCalls(callsResp);
        setAgents(agentsResp);
      } catch (err) {
        console.error('UserTaskReport fetch error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { mounted = false; };
  }, [refreshToggle]);

  const findCallForTask = (task) => {
    const tPhone = normalizePhone(task.phone || '');
    if (!tPhone || !calls || calls.length === 0) return null;

    // prefer most recent call matching last N digits of phone (tolerant to formats)
    const N = 7; // match last 7 digits
    const tail = tPhone.slice(-N);

    const matched = calls
      .map(c => ({ ...c, _created: c.createdAt || c.startTime || c.updatedAt }))
      .filter(c => {
        const raw = c.number || (c.contact && (c.contact.phone || c.contact.number)) || '';
        const callNum = normalizePhone(raw);
        if (!callNum) return false;
        // prefer exact endsWith match on full phone, else match last N digits
        return (tPhone && callNum.endsWith(tPhone)) || (tail && callNum.endsWith(tail));
      })
      .sort((a,b) => new Date(b._created) - new Date(a._created));

    return matched[0] || null;
  };

  const getAgentName = (id) => {
    if (!id) return 'Unassigned';
    const found = agents.find(a => String(a._id || a.id) === String(id));
    return found ? (found.name || found.displayName || 'Agent') : 'Agent';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">User Task Report</h1>
            <div>
              <button
                onClick={() => { setRefreshToggle(v => !v); setLoading(true); }}
                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                    <th className="px-4 py-3 w-1/12">Enquiry ID</th>
                    <th className="px-4 py-3 w-1/6">Client</th>
                    <th className="px-4 py-3 w-1/12">Phone</th>
                    <th className="px-4 py-3 w-1/6">Care Type</th>
                    <th className="px-4 py-3 w-1/12">Task Status</th>
                    <th className="px-4 py-3 w-1/6">Assigned Agent</th>
                    <th className="px-4 py-3 w-1/12">Agent ID</th>
                    <th className="px-4 py-3 w-1/6">Last Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(tasks && tasks.length > 0 ? tasks : (taskReportList || [])).map((task) => {
                    const call = findCallForTask(task);
                    const agentFromCall = call ? (call.assignedTo || call.agent) : null;

                    // Resolve assigned id with fallbacks: assignedTo, task.agentId, stageDetails.stage1.agentId, call
                    const fallbackAgentId = task.agentId || (task.stageDetails && task.stageDetails.stage1 && task.stageDetails.stage1.agentId) || null;
                    const resolvedAssigned = task.assignedTo || fallbackAgentId || (agentFromCall || null);

                    let assignedName = 'Unassigned';
                    if (resolvedAssigned) {
                      if (typeof resolvedAssigned === 'string') {
                        assignedName = getAgentName(resolvedAssigned);
                      } else if (typeof resolvedAssigned === 'object') {
                        assignedName = resolvedAssigned.name || resolvedAssigned.displayName || getAgentName(resolvedAssigned._id || resolvedAssigned.id);
                      }
                    }

                    // Resolve agent id to display (prefer empId or backend id)
                    const resolveAgentId = (idOrObj) => {
                      if (!idOrObj) return '—';
                      if (typeof idOrObj === 'object') {
                        return idOrObj.empId || idOrObj.id || idOrObj._id || '—';
                      }
                      const found = agents.find(a => String(a._id || a.id) === String(idOrObj));
                      if (found) return found.empId || found.id || found._id || '—';
                      return idOrObj;
                    };

                    let agentIdToShow = '—';
                    if (task.assignedTo) {
                      agentIdToShow = typeof task.assignedTo === 'string' ? resolveAgentId(task.assignedTo) : resolveAgentId(task.assignedTo);
                    } else if (fallbackAgentId) {
                      agentIdToShow = resolveAgentId(fallbackAgentId);
                    } else if (agentFromCall) {
                      agentIdToShow = resolveAgentId(agentFromCall);
                    }

                    return (
                      <tr key={task._id || task.clientId} className="text-sm">
                        <td className="px-4 py-3">{task.clientId || (task._id || '').toString().slice(-6)}</td>
                        <td className="px-4 py-3 font-semibold">{task.elderName}</td>
                        <td className="px-4 py-3 font-mono text-xs">{task.phone}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{task.careType}</td>
                        <td className="px-4 py-3 text-xs">{task.taskStatus}</td>
                        <td className="px-4 py-3">{assignedName}</td>
                        <td className="px-4 py-3 font-mono text-xs" title={agentIdToShow}>
                          <span className="break-all">{agentIdToShow}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{call ? (new Date(call.createdAt || call.startTime || call._created).toLocaleString()) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
