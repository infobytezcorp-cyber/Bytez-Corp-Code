import React, { useMemo, useState } from 'react';

const AutoAssign = () => {
  const [isRunning, setIsRunning] = useState(false);

  const incomingLeads = useMemo(
    () => [
      { id: 1, name: 'Priya Anand', phone: '98421-99991', requirement: 'Hot', priority: '58' },
      { id: 2, name: 'Murugan Vel', phone: '97890-99992', requirement: 'Warm', priority: '65' },
      { id: 3, name: 'Viji Suresh', phone: '94876-99993', requirement: 'Cold', priority: '71' }
    ],
    []
  );

  const telecallers = useMemo(
    () => [
      {
        id: 1,
        name: 'Selvi M.',
        initials: 'SM',
        leads: 5,
        maxLeads: 20,
        load: '25%',
        status: 'Free',
        statusColor: 'bg-green-100 text-green-800'
      },
      {
        id: 2,
        name: 'Priya K.',
        initials: 'PK',
        leads: 8,
        maxLeads: 20,
        load: '40%',
        status: 'On Call',
        statusColor: 'bg-yellow-100 text-yellow-800'
      },
      {
        id: 3,
        name: 'Kavi tha R.',
        initials: 'KR',
        leads: 7,
        maxLeads: 20,
        load: '35%',
        status: 'Free',
        statusColor: 'bg-green-100 text-green-800'
      },
      {
        id: 4,
        name: 'Deepa S.',
        initials: 'DS',
        leads: 4,
        maxLeads: 20,
        load: '10%',
        status: 'Break',
        statusColor: 'bg-red-100 text-red-800'
      }
    ],
    []
  );

  const activityLog = useMemo(
    () => [
      {
        time: '10:42 AM',
        lead: 'Rajan Natarajan',
        assigned: 'Selvi M',
        note: '(auto; first free)'
      },
      {
        time: '10:31 AM',
        lead: 'Lakshmi Priya',
        assigned: 'Kavi tha R',
        note: '(auto; first free)'
      }
    ],
    []
  );

  const handleAutoAssign = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const getRequirementColor = (req) => {
    if (req === 'Hot') return 'bg-red-50 text-red-700 border-red-200';
    if (req === 'Warm') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Auto Assign</h2>
          {/* <p className="text-gray-600 mt-1">Automatically distribute leads to available telecallers</p> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Incoming Lead Queue */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incoming Lead Queue</h3>
              <div className="space-y-3">
                {incomingLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-600 mt-1">📞 {lead.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRequirementColor(lead.requirement)}`}>
                        {lead.requirement}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        Score: {lead.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telecaller Availability */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Telecaller Availability</h3>
              <div className="space-y-3">
                {telecallers.map((tc) => (
                  <div key={tc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {tc.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tc.name}</p>
                        <p className="text-xs text-gray-600">{tc.leads} leads • {tc.load} load</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tc.statusColor} border`}
                      >
                        {tc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto Assign Logic Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <p>
                  <strong>Auto assign logic:</strong> Free → first available ⬊ skip On Call & Break
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-2">Next in line: <strong>Selvi M. (free, lowest load)</strong></p>
            </div>
          </div>
        </div>

        {/* Run Auto Assign Button */}
        <div className="mb-8">
          <button
            onClick={handleAutoAssign}
            disabled={isRunning}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isRunning ? '⏳ Assigning...' : '▶ Run Auto Assign Now'}
          </button>
        </div>

        {/* Auto Assign Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto Assign Activity Log</h3>
          <div className="space-y-3">
            {activityLog.map((log, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <strong>{log.lead}</strong> → <span className="text-red-600">{log.assigned}</span> {log.note}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoAssign;
