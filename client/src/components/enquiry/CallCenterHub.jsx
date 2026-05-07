import React, { useState } from 'react';
import Sidebar from '../dashboards/Sidebar';
import LeadsAndCalls from './callcenter/LeadsAndCalls';
import MissedCalls from './callcenter/MissedCalls';
import Recordings from './callcenter/Recordings';
import AutoAssign from './callcenter/AutoAssign';

const CallCenterHub = () => {
  const [activeTab, setActiveTab] = useState('leads');

  const tabs = [
    { id: 'leads', label: 'Leads & Calls', icon: '📞' },
    { id: 'missed', label: 'Missed Calls', icon: '📱', badge: 7 },
    { id: 'recordings', label: 'Recordings', icon: '🎙️' },
    { id: 'autoassign', label: 'Auto Assign', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsAndCalls />;
      case 'missed':
        return <MissedCalls />;
      case 'recordings':
        return <Recordings />;
      case 'autoassign':
        return <AutoAssign />;
      default:
        return <LeadsAndCalls />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Tabs */}
        <div className="py-8">
          <div className="max-w-full mx-auto px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4"></h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.badge && (
                    <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CallCenterHub;
