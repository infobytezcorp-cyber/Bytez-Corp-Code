import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

const MissedCalls = () => {
  const { enquiries } = useSelector((state) => state.enquiry);

  // Sample missed calls data
  const missedCallsData = useMemo(() => {
    return [
      {
        id: 1,
        date: 'Apr 18',
        time: '9:14 AM',
        name: 'Meena Rajesh',
        phone: '98421-11111',
        telecaller: 'Selvi M',
        reason: 'DND on',
        status: 'Actioned'
      },
      {
        id: 2,
        date: 'Apr 18',
        time: '11:30 AM',
        name: 'Arjun Selvam',
        phone: '97890-22222',
        telecaller: 'Priya K',
        reason: 'On another call',
        status: 'Actioned'
      },
      {
        id: 3,
        date: 'Apr 18',
        time: '2:55 PM',
        name: 'Rajan Natarajan',
        phone: '99401-44444',
        telecaller: 'Selvi M',
        reason: 'On break',
        status: 'Actioned'
      },
      {
        id: 4,
        date: 'Apr 17',
        time: '10:05 AM',
        name: 'Priya Anand',
        phone: '94876-66666',
        telecaller: 'Kavi tha R',
        reason: 'No answer',
        status: 'Actioned'
      },
      {
        id: 5,
        date: 'Apr 17',
        time: '4:20 PM',
        name: 'Babu Krishnan',
        phone: '95678-77777',
        telecaller: 'Deepa S',
        reason: 'DND on',
        status: 'Actioned'
      }
    ];
  }, []);

  // Group by date
  const groupedByDate = useMemo(() => {
    const grouped = {};
    missedCallsData.forEach((call) => {
      if (!grouped[call.date]) {
        grouped[call.date] = [];
      }
      grouped[call.date].push(call);
    });
    return grouped;
  }, [missedCallsData]);

  const getTodayMissedCount = () => {
    return missedCallsData.filter((c) => c.date === 'Apr 18').length;
  };

  const stats = [
    { label: 'Today Missed', value: getTodayMissedCount(), color: 'text-red-600' },
    { label: 'Actioned', value: missedCallsData.filter((c) => c.status === 'Actioned').length, color: 'text-green-600' },
    { label: 'Pending', value: '0', color: 'text-yellow-600' },
    { label: 'Top Master', value: 'Selvi M.', subValue: '3 missed', color: 'text-gray-600' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Missed Calls</h2>
          <p className="text-gray-600 mt-1">Track and manage missed call attempts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.subValue && <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>}
            </div>
          ))}
        </div>

        {/* Missed Calls Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Day-wise Missed Call Log </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Telecaller
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {missedCallsData.map((call) => (
                  <tr key={call.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {call.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={`tel:${call.phone}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {call.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {call.telecaller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{call.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissedCalls;
