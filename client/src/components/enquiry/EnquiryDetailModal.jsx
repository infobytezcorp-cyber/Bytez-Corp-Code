import React, { useState, useEffect, useMemo } from 'react';

const EnquiryDetailModal = ({ enquiry, allEnquiries, onClose, onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    elderName: enquiry?.elderName || '',
    familyName: enquiry?.familyName || '',
    phone: enquiry?.phone || '',
    email: enquiry?.email || '',
    stage: enquiry?.stage || '',
    source: enquiry?.source || '',
    careType: enquiry?.careType || '',
  });

  // Get all submissions for this client (same clientId) sorted by date
  const clientHistory = useMemo(() => {
    if (!enquiry?.clientId || !allEnquiries) return [];
    
    return allEnquiries
      .filter(e => e.clientId === enquiry.clientId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [enquiry?.clientId, allEnquiries]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!enquiry) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...enquiry,
        ...formData
      });
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      elderName: enquiry.elderName || '',
      familyName: enquiry.familyName || '',
      phone: enquiry.phone || '',
      email: enquiry.email || '',
      stage: enquiry.stage || '',
      source: enquiry.source || '',
      careType: enquiry.careType || '',
    });
    setIsEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl w-full sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-white">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Client Details & History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Client ID Badge */}
          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Client ID</p>
            <div className="inline-block bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-mono font-bold text-sm sm:text-lg">
              {enquiry.clientId || 'N/A'}
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
            {!isEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Elder Name</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.elderName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Family Name</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.familyName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Aadhaar</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.aadhaar || '-'}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.phone}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.email || '-'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Elder Name</label>
                  <input
                    type="text"
                    name="elderName"
                    value={formData.elderName}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Family Name</label>
                  <input
                    type="text"
                    name="familyName"
                    value={formData.familyName}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enquiry Details */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Enquiry Details</h3>
            {!isEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">First Stage</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.firstStage || enquiry.stage}</p>
                </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div>
    <p className="text-xs sm:text-sm text-gray-600">Stage</p>
    <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.currentStage}</p>
  </div>
  {/* First Stage row inge thevaiyillai, yenil ithu thani row-aaga table-il irukkum */}
</div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Source</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.source}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Care Type</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.careType || '-'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Created Date</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New Enquiry">New Enquiry</option>
                    <option value="Contact">Contact</option>
                    <option value="Pitching">Pitching</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tawk.to">Tawk.to</option>
                    <option value="Website">Website</option>
                    <option value="Telecaller">Telecaller</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Care Type</label>
                  <input
                    type="text"
                    name="careType"
                    value={formData.careType}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submission History for this Client */}
          {clientHistory && clientHistory.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Submission History ({clientHistory.length} submissions)
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {clientHistory.map((entry, index) => {
                  const stageColors = {
                    'New Enquiry': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'Contact': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Pitching': 'bg-purple-50 text-purple-700 border-purple-200',
                    'Enrolled': 'bg-green-50 text-green-700 border-green-200'
                  };
                  const colorClass = stageColors[entry.stage] || 'bg-gray-50 text-gray-700 border-gray-200';
                  
                  return (
                    <div key={entry.id} className={`p-4 sm:p-5 rounded-lg border ${colorClass}`}>
                      {/* Header with Stage and Badge */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div>
                          <p className="font-semibold text-sm sm:text-base">
                            Submission #{index + 1}: <span className="font-bold">{entry.stage}</span>
                          </p>
                          <p className="text-xs sm:text-sm mt-1">
                            📅 {new Date(entry.createdAt).toLocaleDateString()} 
                            {' '}
                            ⏰ {new Date(entry.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {index === clientHistory.length - 1 && (
                          <span className="ml-2 px-2 py-1 bg-white text-xs font-bold rounded-full">
                            LATEST
                          </span>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Elder Name</p>
                          <p className="text-sm font-medium">{entry.elderName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Family Name</p>
                          <p className="text-sm font-medium">{entry.familyName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Phone</p>
                          <p className="text-sm font-medium">{entry.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Email</p>
                          <p className="text-sm font-medium">{entry.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Aadhaar</p>
                          <p className="text-sm font-medium">{entry.aadhaar || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Source</p>
                          <p className="text-sm font-medium">{entry.source}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Care Type</p>
                          <p className="text-sm font-medium">{entry.careType || '-'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-2 sm:gap-3 flex-shrink-0">
          {!isEditMode ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setIsEditMode(true)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Enquiry
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetailModal;
