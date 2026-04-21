import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const LeadsAndCalls = () => {
  const dispatch = useDispatch();
  const { enquiries } = useSelector((state) => state.enquiry);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Image-la iruntha status badge styles
  const getStatusBadge = (isAnswered, missedCount = 1) => {
    if (isAnswered) {
      return (
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-[#ecf4e6] text-[#3d6129]">
          Answered
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-[#f9ebeb] text-[#9c3a3a]">
          Missed ×{missedCount}
        </span>
      );
    }
  };

  // 2. Logic to filter and group enquiries
  const callLeads = useMemo(() => {
    let filtered = enquiries;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.elderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.phone?.includes(searchTerm)
      );
    }

    const latestByClient = {};
    filtered.forEach((enquiry) => {
      const clientId = enquiry.clientId;
      if (
        !latestByClient[clientId] ||
        new Date(enquiry.createdAt) > new Date(latestByClient[clientId].createdAt)
      ) {
        latestByClient[clientId] = enquiry;
      }
    });

    return Object.values(latestByClient);
  }, [enquiries, searchTerm]);

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leads & Calls</h2>
          <p className="text-gray-600 mt-1">Click on phone number to dial directly</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by patient name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone (Click to call)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Telecaller</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Call</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {callLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No leads available</td>
                  </tr>
                ) : (
                  callLeads.map((lead, index) => {
                    // Mocking call data for UI demo - replace with lead.isAnswered etc from backend
                    const isAnsweredMock = index % 2 === 0; 
                    const missedCountMock = (index % 3) + 1;

                    return (
                      <tr key={lead._id || index} className="hover:bg-blue-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">{lead.elderName}</p>
                            <p className="text-sm text-gray-500">{lead.familyName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhoneClick(lead.phone);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors"
                          >
                            📞 {lead.phone}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.careType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-lg font-bold ${getScoreColor(75)}`}>
                            75
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">Selvi M.</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Image-la iruntha dynamic status inga thaan apply aaguthu */}
                          {getStatusBadge(isAnsweredMock, missedCountMock)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating status bar */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-medium">📱 Ready to connect calls...</span>
        </div>
      </div>
    </div>
  );
};

export default LeadsAndCalls;