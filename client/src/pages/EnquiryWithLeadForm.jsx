import React, { useState } from 'react';
import LeadForm from '../components/enquiry/leadForm/LeadForm';
import EnquiryListContent from '../components/enquiry/EnquiryListContent';

const EnquiryWithLeadForm = () => {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-4 border-b border-gray-200 px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Lead Entry Form
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Enquiry List
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'leads' && <LeadForm />}
        {activeTab === 'list' && <EnquiryListContent />}
      </div>
    </div>
  );
};

export default EnquiryWithLeadForm;
