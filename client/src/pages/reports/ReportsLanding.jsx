import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboards/Sidebar';

export default function ReportsLanding() {
  const navigate = useNavigate();
  const reports = [
    // { key: 'user-report', label: 'User Report', path: '/reports/user' },
    { key: 'user-activity', label: 'User Activity Report', path: '/reports/activity' },
    { key: 'user-call', label: 'User Call Report', path: '/reports/calls' },
    { key: 'follow-up', label: 'Follow-Up Report', path: '/reports/followup' },
    { key: 'login-report', label: 'Login Report', path: '/reports/login' },
    { key: 'user-tasks', label: 'User Task Report', path: '/reports/tasks' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold mb-4">Reports</h1>
          <p className="text-sm text-gray-600 mb-6">Available reports — click to open</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(r => (
              <button
                key={r.key}
                onClick={() => navigate(r.path)}
                className="text-left bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2"
              >
                <div className="text-lg font-bold">{r.label}</div>
                <div className="text-xs text-gray-500">Open {r.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
