import React from 'react';
import Sidebar from '../../components/dashboards/Sidebar';

export default function PlaceholderReport({ title }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <p className="text-sm text-gray-600">This report is not yet implemented. I created a placeholder page — I can implement the full report (data aggregation, filters, export) next.</p>
        </div>
      </div>
    </div>
  );
}
