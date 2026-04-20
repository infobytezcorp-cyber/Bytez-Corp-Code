import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnquiries, setFilters, updateEnquiry } from '../../features/enquirySlice';
import { ENQUIRY_STAGES, ENQUIRY_SOURCES } from '../../constants/enquiryConstants';
import EnquiryDetailModal from './EnquiryDetailModal';
import Sidebar from '../dashboards/visitors/Sidebar';

const EnquiryListContent = () => {
  const dispatch = useDispatch();
  const { enquiries, loading, filters } = useSelector((state) => state.enquiry);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1. Fetch ALL enquiries once so stat cards always have the complete pipeline data
  useEffect(() => {
    dispatch(fetchEnquiries());
  }, [dispatch]);

  // 2. Global Stats: Calculated from the unfiltered global 'enquiries' state
  const stats = useMemo(() => {
    const enrolledCount = enquiries.filter(e => e.stage === 'Enrolled').length;
    const newCount = enquiries.filter(e => e.stage === 'New Enquiry').length;
    const contactCount = enquiries.filter(e => e.stage === 'Contact').length;
    const pitchingCount = enquiries.filter(e => e.stage === 'Pitching').length;
    
    return {
      total: enquiries.length,
      newEnquiries: newCount,
      inContact: contactCount,
      proposal: pitchingCount,
      enrolled: enrolledCount,
      bySource: {
        'Website': enquiries.filter(e => e.source === 'Website').length,
        'Telecaller': enquiries.filter(e => e.source === 'Telecaller').length,
        'Tawk.to': enquiries.filter(e => e.source === 'Tawk.to').length,
        'Referral': enquiries.filter(e => e.source === 'Referral').length,
      },
      averageConversionRate: enquiries.length > 0 
        ? Math.round((enrolledCount / enquiries.length) * 100) 
        : 0,
    };
  }, [enquiries]);

  // Generate unique client ID format (ABCDE12345)
  const generateClientId = useCallback((id) => {
    if (!id) return 'N/A';
    // Take first 5 characters and convert to letters
    const letters = id.substring(0, 5).toUpperCase().replace(/[0-9]/g, (match, offset) => {
      const letterMap = ['A', 'B', 'C', 'D', 'E'];
      return letterMap[offset % 5];
    });
    // Take last 5 digits
    const numbers = id.substring(id.length - 5);
    return `${letters}${numbers}`;
  }, []);

  // Filtered Source Stats: Show only selected source or all sources
  const filteredSourceStats = useMemo(() => {
    if (filters.source) {
      // When a source filter is selected, show only that source
      return {
        [filters.source]: enquiries.filter(e => e.source === filters.source).length
      };
    } else {
      // When no source filter, show all sources
      return stats.bySource;
    }
  }, [enquiries, filters.source, stats.bySource]);

  // 3. Local Filtering: Create a filtered list specifically for the Table display
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enquiry => {
      const matchStage = filters.stage ? enquiry.stage === filters.stage : true;
      const matchSource = filters.source ? enquiry.source === filters.source : true;
      const clientId = generateClientId(enquiry._id);
      const matchSearch = filters.searchTerm 
        ? (clientId?.includes(filters.searchTerm.toUpperCase()) || 
           enquiry.phone?.includes(filters.searchTerm))
        : true;
      
      return matchStage && matchSource && matchSearch;
    });
  }, [enquiries, filters, generateClientId]);

  const getStageColor = (stage) => {
    const colors = {
      'New Enquiry': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Contact': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Pitching': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Enrolled': 'bg-green-50 text-green-700 border border-green-200'
    };
    return colors[stage] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSourceColorClass = (source) => {
    const colors = {
      'Website': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'Telecaller': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Tawk.to': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      'Referral': 'bg-pink-50 text-pink-700 border border-pink-200'
    };
    return colors[source] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSourceColor = (source) => {
    const colors = {
      'Website': 'indigo',
      'Telecaller': 'orange',
      'Tawk.to': 'cyan',
      'Referral': 'pink'
    };
    return colors[source] || 'gray';
  };

  const handleViewDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const handleSaveEnquiry = async (updatedEnquiry) => {
    try {
      const result = await dispatch(updateEnquiry({
        id: updatedEnquiry._id,
        data: updatedEnquiry
      })).unwrap();
      
      // Update successful
      console.log('Enquiry updated successfully:', result);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating enquiry:', error);
      alert('Failed to update enquiry. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SpeedMeter = ({ value }) => {
    const getSpeedColor = () => {
      if (value < 34) return { fill: '#ef4444', label: 'Low' };
      if (value < 67) return { fill: '#eab308', label: 'Medium' };
      return { fill: '#22c55e', label: 'High' };
    };

    const color = getSpeedColor();
    const angle = (value / 100) * 180;

    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col justify-center">
        <p className="text-sm font-medium text-gray-600 mb-6 text-center">Conversion Rate</p>
        <div className="flex flex-col items-center justify-center">
          <svg width="200" height="140" viewBox="0 0 150 100" className="mb-6">
            <path
              d="M 20 80 A 60 60 0 0 1 130 80"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 20 80 A 60 60 0 0 1 130 80"
              stroke={color.fill}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * (Math.PI * 60)} ${Math.PI * 60}`}
              opacity="0.8"
            />
            <line
              x1="75"
              y1="80"
              x2={75 + 50 * Math.cos((angle - 90) * (Math.PI / 180))}
              y2={80 + 50 * Math.sin((angle - 90) * (Math.PI / 180))}
              stroke={color.fill}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="75" cy="80" r="5" fill={color.fill} />
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = (tick / 100) * 180;
              const tickX1 = 75 + 60 * Math.cos((tickAngle - 90) * (Math.PI / 180));
              const tickY1 = 80 + 60 * Math.sin((tickAngle - 90) * (Math.PI / 180));
              const tickX2 = 75 + 68 * Math.cos((tickAngle - 90) * (Math.PI / 180));
              const tickY2 = 80 + 68 * Math.sin((tickAngle - 90) * (Math.PI / 180));
              return (
                <line
                  key={tick}
                  x1={tickX1}
                  y1={tickY1}
                  x2={tickX2}
                  y2={tickY2}
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <div className="text-center">
            <p className="text-5xl font-bold" style={{ color: color.fill }}>{value}%</p>
            <p className="text-sm font-medium text-gray-500 mt-2" style={{ color: color.fill }}>{color.label} Conversion</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 bg-white">
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer enquiries and CRM stages</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="w-full mx-auto">
              {/* Stats Grid - Main Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                  title="Total Enquiries"
                  value={stats.total}
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  bgColor="bg-blue-500"
                />
                <StatCard
                  title="New Enquiries"
                  value={stats.newEnquiries}
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                  bgColor="bg-yellow-500"
                />
                <StatCard
                  title="In Contact"
                  value={stats.inContact}
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                  bgColor="bg-blue-600"
                />
                <StatCard
                  title="Enrolled"
                  value={stats.enrolled}
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  bgColor="bg-green-500"
                />
                <StatCard
                  title="Pitching Stage"
                  value={stats.proposal}
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  bgColor="bg-purple-500"
                />
                
              </div>

              {/* Secondary Stats - CRM Progress */}
              <div className="flex-1 overflow-y-auto w-20rem mx-auto p-8">

                <SpeedMeter value={stats.averageConversionRate} />
              </div>

              {/* Filters Section - Column Wise Design */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stage Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CRM Stage</label>
                    <select
                      value={filters.stage || ''}
                      onChange={(e) => dispatch(setFilters({ stage: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">All Stages</option>
                      <option value="New Enquiry">New Enquiry</option>
                      <option value="Contact">Contact</option>
                      <option value="Pitching">Pitching</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <select
                      value={filters.source || ''}
                      onChange={(e) => dispatch(setFilters({ source: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">All Sources</option>
                      <option value="Website">Website</option>
                      <option value="Telecaller">Telecaller</option>
                      <option value="Tawk.to">Tawk.to</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search by ID or Phone</label>
                    <input
                      type="text"
                      placeholder="Client ID or phone number..."
                      onChange={(e) => dispatch(setFilters({ searchTerm: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Source Distribution Chart */}
              {!loading && enquiries.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {filters.source ? `${filters.source} - Enquiry Distribution` : 'Enquiries by Source'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(filteredSourceStats).map(([source, count]) => {
                      const displayTotal = filters.source ? count : stats.total;
                      return (
                        <div key={source} className="flex flex-col items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                          <p className="text-sm text-gray-600 mt-1">{source}</p>
                          {displayTotal > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                              <div
                                className={`h-2 rounded-full`}
                                style={{ 
                                  width: `${filters.source ? 100 : (count / stats.total) * 100}%`, 
                                  backgroundColor: getSourceColor(source) === 'indigo' ? '#4f46e5' : getSourceColor(source) === 'orange' ? '#f97316' : getSourceColor(source) === 'green' ? '#22c55e' : '#ec4899' 
                                }}
                              />
                            </div>
                          )}
                          {displayTotal > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {filters.source ? '100%' : `${Math.round((count / stats.total) * 100)}%`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enquiries Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading enquiries...</p>
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 text-lg mt-2">No enquiries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Elder Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stage</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Care Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEnquiries.map((enquiry) => (
                          <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold">
                                {generateClientId(enquiry._id)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-medium text-gray-900">{enquiry.elderName}</p>
                              <p className="text-sm text-gray-500">{enquiry.familyName || '-'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{enquiry.phone}</p>
                              <p className="text-xs text-gray-500">{enquiry.email || '-'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(enquiry.stage)}`}>
                                {enquiry.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColorClass(enquiry.source)}`}>
                                {enquiry.source}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{enquiry.careType || '-'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {new Date(enquiry.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleViewDetail(enquiry)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm transition-colors"
                              >
                                View Details
                              </button>
                            </td>
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
      </div>

      {/* Detail Modal */}
      {showModal && selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEnquiry}
        />
      )}
    </div>
  );
};

export default EnquiryListContent;
