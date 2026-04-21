import React, { useMemo } from 'react';

const Recordings = () => {
  const recordingsData = useMemo(
    () => [
      {
        id: 1,
        title: 'Meena Rajesh — Qualification call',
        telecaller: 'Selvi M',
        date: 'Apr 15',
        time: '11:20 AM',
        duration: '6m 14s',
        storage: 'CRM',
        recordingUrl: '#'
      },
      {
        id: 2,
        title: 'Arjun Selvam — First contact',
        telecaller: 'Priya K',
        date: 'Apr 16',
        time: '3:00 PM',
        duration: '3m 42s',
        storage: 'S3 Cloud',
        recordingUrl: '#'
      },
      {
        id: 3,
        title: 'Lakshmi Priya — Service confirmation',
        telecaller: 'Kavi tha R',
        date: 'Apr 17',
        time: '9:00 AM',
        duration: '4m 58s',
        storage: 'CRM',
        recordingUrl: '#'
      },
      {
        id: 4,
        title: 'Rajan Natarajan — Budget discussion',
        telecaller: 'Selvi M',
        date: 'Apr 14',
        time: '2:30 PM',
        duration: '7m 02s',
        storage: 'S3 Cloud',
        recordingUrl: '#'
      },
      {
        id: 5,
        title: 'Sundar Kumar — Initial enquiry',
        telecaller: 'Priya K',
        date: 'Apr 18',
        time: '10:00 AM',
        duration: '2m 30s',
        storage: 'CRM',
        recordingUrl: '#'
      }
    ],
    []
  );

  const getStorageColor = (storage) => {
    return storage === 'CRM'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-green-50 text-green-700 border-green-200';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recording Vault</h2>
        </div>

        {/* Recordings List */}
        <div className="space-y-3">
          {recordingsData.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Play Button */}
                <button className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-blue-600 text-lg">▶</span>
                </button>

                {/* Recording Details */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{recording.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{recording.telecaller}</span>
                    <span>•</span>
                    <span>{recording.date} - {recording.time}</span>
                    <span>•</span>
                    <span>⏱ {recording.duration}</span>
                  </div>
                </div>

                {/* Storage Badge */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStorageColor(
                    recording.storage
                  )}`}
                >
                  {recording.storage}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {recording.storage === 'S3 Cloud' ? (
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                      Open Link
                    </button>
                  ) : (
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Help */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900">
            💡 <strong>Tip:</strong> Recordings are stored for compliance and quality assurance. Use them to train
            telecallers and improve call quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recordings;
