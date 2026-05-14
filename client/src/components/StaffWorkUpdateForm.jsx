import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitWorkUpdate } from '../features/workUpdateSlice';

const StaffWorkUpdateForm = ({ staffSession, staffInfo, task, onSuccess }) => {
  const staff = staffSession || staffInfo;
  const dispatch = useDispatch();
  const { loading, successMessage, error } = useSelector(state => state.workUpdates);

  const [formData, setFormData] = useState({
    workDescription: '',
    duration: 30,
    workType: 'Other',
    taskId: task?._id || task?.id || '',
    staffEmpId: staff?.empId || '',
    staffName: staff?.empName || staff?.name || '',
    latitude: null,
    longitude: null,
    accuracy: null,
    address: 'Not provided'
  });

  // Update formData if task or staff changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      taskId: task?._id || task?.id || '',
      staffEmpId: staff?.empId || '',
      staffName: staff?.empName || staff?.name || '',
    }));
  }, [task, staff]);

  const [attachments, setAttachments] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }));
          setLocationError(null);
        },
        (error) => {
          console.warn('Location access denied:', error.message);
          setLocationError('Location access denied. Updates will be submitted without location.');
        }
      );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 5MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 5MB allowed.`);
        return false;
      }
      return true;
    });

    // Convert to base64
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          data: event.target.result,
          description: ''
        }]);
        setPreviewFiles(prev => [...prev, file.name]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.workDescription.trim()) {
      alert('Please enter work description');
      return;
    }

    if (formData.duration < 1 || formData.duration > 60) {
      alert('Duration must be between 1 and 60 minutes');
      return;
    }

    const updateData = {
      staffId: staff?.userId || staff?._id || null,
      staffEmpId: formData.staffEmpId,
      staffName: formData.staffName,
      taskId: formData.taskId || null,
      workDescription: formData.workDescription,
      duration: formData.duration,
      workType: formData.workType,
      proofAttachments: attachments,
      latitude: formData.latitude,
      longitude: formData.longitude,
      accuracy: formData.accuracy,
      address: formData.address
    };

    const result = await dispatch(submitWorkUpdate(updateData));
    
    if (result.type === submitWorkUpdate.fulfilled.type) {
      // Reset form
      setFormData({
        workDescription: '',
        duration: 30,
        workType: 'Other',
        taskId: '',
        latitude: formData.latitude,
        longitude: formData.longitude,
        accuracy: formData.accuracy,
        address: formData.address
      });
      setAttachments([]);
      setPreviewFiles([]);
      onSuccess?.(); 
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📝 Hourly Work Update</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      {locationError && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
          ⚠️ {locationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Work Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What did you do? *
          </label>
          <textarea
            name="workDescription"
            value={formData.workDescription}
            onChange={handleInputChange}
            placeholder="Describe your work activities..."
            rows="4"
            maxLength="1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <span className="text-xs text-gray-500">
            {formData.workDescription.length}/1000 characters
          </span>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type of Work
            </label>
            <select
              name="workType"
              value={formData.workType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Patient Visit">Patient Visit</option>
              <option value="Call">Call</option>
              <option value="Documentation">Documentation</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Task ID (Auto-filled, hidden) */}
        {/* <input type="hidden" name="taskId" value={formData.taskId} /> */}

        {/* File Upload for Proof */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📎 Proof/Attachments (Photos, Documents, etc.)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="text-gray-600">
                <p className="text-lg font-semibold">Drag files here or click to select</p>
                <p className="text-xs text-gray-500">Max 5MB per file • Supports images, PDF, documents</p>
              </div>
            </label>
          </div>

          {/* Attached Files Preview */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Attached Files:</h4>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {file.fileType.includes('image') ? '🖼️' : '📄'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            📍 <strong>Location:</strong> {formData.latitude && formData.longitude 
              ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)} (±${formData.accuracy?.toFixed(1)}m)`
              : 'Location will be captured on submission'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '⏳ Submitting...' : '✓ Submit Work Update'}
        </button>
      </form>
    </div>
  );
};

export default StaffWorkUpdateForm;
