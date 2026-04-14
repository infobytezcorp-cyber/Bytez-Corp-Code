import React, { useState, useEffect } from 'react';

const EnquiryDetailModal = ({ enquiry, onClose, onSave }) => {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!enquiry) return null;

  // Generate unique client ID format (ABCDE12345)
  const generateClientId = (id) => {
    if (!id) return 'N/A';
    const letters = id.substring(0, 5).toUpperCase().replace(/[0-9]/g, (match, offset) => {
      const letterMap = ['A', 'B', 'C', 'D', 'E'];
      return letterMap[offset % 5];
    });
    const numbers = id.substring(id.length - 5);
    return `${letters}${numbers}`;
  };

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
      <div className="bg-white rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-white">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enquiry Details</h2>
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
              {generateClientId(enquiry._id)}
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
                  <p className="text-xs sm:text-sm text-gray-600">Stage</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{enquiry.stage}</p>
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

          {/* Timeline */}
          {enquiry.timeline && enquiry.timeline.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timeline</h3>
              <div className="space-y-2 sm:space-y-3">
                {enquiry.timeline.map((entry, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 sm:mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{entry.event}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
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
