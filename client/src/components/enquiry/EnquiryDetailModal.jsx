import React, { useEffect, useMemo, useState } from 'react';
import { ENQUIRY_LEADS } from '../../constants/enquiryConstants';

const API_URL = import.meta.env.VITE_API_URL || 'https://307c-2406-7400-ff03-198-9c9d-16ec-176f-1b18.ngrok-free.app';

const stageColors = {
  'New Enquiry': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Contact: 'bg-blue-50 text-blue-700 border-blue-200',
  Pitching: 'bg-purple-50 text-purple-700 border-purple-200',
  Enrolled: 'bg-green-50 text-green-700 border-green-200',
};

const renderValue = (value) => {
  if (Array.isArray(value)) return value.join(', ');
  if (value === undefined || value === null || value === '') return '-';
  return value;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const DetailGrid = ({ fields }) => {
  const visibleFields = fields.filter((field) => {
    if (Array.isArray(field.value)) return field.value.length > 0;
    return field.value !== undefined && field.value !== null && field.value !== '';
  });

  if (!visibleFields.length) {
    return <p className="text-sm text-gray-500">No details available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {visibleFields.map((field) => (
        <div key={field.label}>
          <p className="text-xs sm:text-sm text-gray-600">{field.label}</p>
          <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
            {renderValue(field.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

const EnquiryDetailModal = ({ enquiry, allEnquiries, onClose, onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOpeningDocument, setIsOpeningDocument] = useState(false);
  const [documentUnavailable, setDocumentUnavailable] = useState(false);
  const [formData, setFormData] = useState({
    elderName: enquiry?.elderName || '',
    familyName: enquiry?.familyName || '',
    phone: enquiry?.phone || '',
    email: enquiry?.email || '',
    stage: enquiry?.stage || '',
    lead: enquiry?.lead || enquiry?.source || '',
    careType: enquiry?.careType || '',
  });
  const enquiryId = enquiry?._id || enquiry?.id;

  const clientHistory = useMemo(() => {
    if (!enquiry?.clientId || !allEnquiries) return [];

    return allEnquiries
      .filter((entry) => entry.clientId === enquiry.clientId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [allEnquiries, enquiry?.clientId]);

  const personalDetails = useMemo(
    () => ({
      patientName: enquiry?.elderName || '',
      familyName: enquiry?.familyName || '',
      clientName: enquiry?.personalDetails?.clientName || '',
      age: enquiry?.personalDetails?.age || '',
      gender: enquiry?.personalDetails?.gender || '',
      guardianName: enquiry?.personalDetails?.guardianName || enquiry?.familyName || '',
      guardianRelationship: enquiry?.personalDetails?.guardianRelationship || '',
      phone: enquiry?.phone || enquiry?.personalDetails?.phone || '',
      whatsapp: enquiry?.personalDetails?.whatsapp || '',
      alternatePhone: enquiry?.personalDetails?.alternatePhone || '',
      email: enquiry?.email || enquiry?.personalDetails?.email || '',
      aadhaar: enquiry?.aadhaar || enquiry?.personalDetails?.aadhaar || '',
      city: enquiry?.personalDetails?.city || '',
      urgency: enquiry?.personalDetails?.urgency || '',
      telecaller: enquiry?.personalDetails?.telecaller || '',
      agentId: enquiry?.personalDetails?.agentId || '',
    }),
    [enquiry]
  );

  const stageSections = useMemo(() => {
    const timelineLookup = (enquiry?.timeline || []).reduce((acc, item) => {
      const text = `${item?.event || ''} ${item?.status || ''}`.toLowerCase();
      if (!acc.stage1 && text.includes('new enquiry')) acc.stage1 = item?.date;
      if (!acc.stage2 && text.includes('pitching')) acc.stage2 = item?.date;
      if (!acc.stage3 && text.includes('enrolled')) acc.stage3 = item?.date;
      return acc;
    }, {});

    return [
      {
        key: 'stage1',
        title: 'New Enquiry',
        savedAt: enquiry?.stageDetails?.stage1?.savedAt || timelineLookup.stage1 || enquiry?.createdAt,
        fields: [
          { label: 'Patient Name', value: enquiry?.stageDetails?.stage1?.patientName },
          { label: 'Client Name', value: enquiry?.stageDetails?.stage1?.clientName },
          { label: 'Age', value: enquiry?.stageDetails?.stage1?.age },
          { label: 'Gender', value: enquiry?.stageDetails?.stage1?.gender },
          { label: 'Guardian Name', value: enquiry?.stageDetails?.stage1?.guardianName },
          { label: 'Relationship', value: enquiry?.stageDetails?.stage1?.guardianRelationship },
          { label: 'Phone', value: enquiry?.stageDetails?.stage1?.phone },
          { label: 'WhatsApp', value: enquiry?.stageDetails?.stage1?.whatsapp },
          { label: 'Alternate Number', value: enquiry?.stageDetails?.stage1?.alternatePhone },
          { label: 'Mail ID', value: enquiry?.stageDetails?.stage1?.email },
          { label: 'Aadhaar', value: enquiry?.stageDetails?.stage1?.aadhaar },
          { label: 'City / Area', value: enquiry?.stageDetails?.stage1?.city },
          { label: 'Urgency', value: enquiry?.stageDetails?.stage1?.urgency },
          { label: 'Telecaller', value: enquiry?.stageDetails?.stage1?.telecaller },
          { label: 'Agent ID', value: enquiry?.stageDetails?.stage1?.agentId },
          { label: 'Service', value: enquiry?.stageDetails?.stage1?.service },
          { label: 'Lead Source', value: enquiry?.stageDetails?.stage1?.leadSource },
        ],
      },
      {
        key: 'stage2',
        title: 'Pitching',
        savedAt: enquiry?.stageDetails?.stage2?.savedAt || timelineLookup.stage2,
        fields: [
          { label: 'Condition', value: enquiry?.stageDetails?.stage2?.condition },
          { label: 'Mobility', value: enquiry?.stageDetails?.stage2?.mobility },
          { label: 'Dependency', value: enquiry?.stageDetails?.stage2?.dependency },
          { label: 'Medications', value: enquiry?.stageDetails?.stage2?.medications },
          { label: 'Allergies', value: enquiry?.stageDetails?.stage2?.allergies },
          { label: 'Nearest Hospital', value: enquiry?.stageDetails?.stage2?.nearestHospital },
          { label: 'Diet', value: enquiry?.stageDetails?.stage2?.diet },
          { label: 'Diseases', value: enquiry?.stageDetails?.stage2?.diseases },
          { label: 'Child Name', value: enquiry?.stageDetails?.stage2?.childName },
          { label: 'Child Age', value: enquiry?.stageDetails?.stage2?.childAge },
          { label: 'Child Count', value: enquiry?.stageDetails?.stage2?.childCount },
          { label: 'Language Preference', value: enquiry?.stageDetails?.stage2?.languagePreference },
          { label: 'Feeding Support', value: enquiry?.stageDetails?.stage2?.feedingSupport },
          { label: 'Patient Hours', value: enquiry?.stageDetails?.stage2?.patientHours },
          { label: 'Special Notes', value: enquiry?.stageDetails?.stage2?.specialNotes },
          { label: 'Household Count', value: enquiry?.stageDetails?.stage2?.householdCount },
          { label: 'Service Hours', value: enquiry?.stageDetails?.stage2?.serviceHours },
          { label: 'Cooking Preference', value: enquiry?.stageDetails?.stage2?.cookingPreference },
          { label: 'Pets', value: enquiry?.stageDetails?.stage2?.pets },
          { label: 'Duties', value: enquiry?.stageDetails?.stage2?.duties },
          { label: 'Preferred Start Date', value: enquiry?.stageDetails?.stage2?.preferredStartDate },
          { label: 'Duration', value: enquiry?.stageDetails?.stage2?.duration },
          { label: 'Address', value: enquiry?.stageDetails?.stage2?.address },
          { label: 'Budget', value: enquiry?.stageDetails?.stage2?.budget },
          { label: 'Decision Maker', value: enquiry?.stageDetails?.stage2?.decisionMaker },
          { label: 'Concerns', value: enquiry?.stageDetails?.stage2?.concerns },
          { label: 'Follow Up', value: enquiry?.stageDetails?.stage2?.followUp },
          { label: 'Pitch Status', value: enquiry?.stageDetails?.stage2?.pitchStatus },
        ],
      },
      {
        key: 'stage3',
        title: 'Enrolled',
        savedAt: enquiry?.stageDetails?.stage3?.savedAt || timelineLookup.stage3,
        fields: [
          { label: 'Start Date', value: enquiry?.stageDetails?.stage3?.startDate },
          { label: 'End Date', value: enquiry?.stageDetails?.stage3?.endDate },
          { label: 'Care Plan', value: enquiry?.stageDetails?.stage3?.carePlan },
          { label: 'Visit Frequency', value: enquiry?.stageDetails?.stage3?.visitFrequency },
          { label: 'Emergency Support', value: enquiry?.stageDetails?.stage3?.emergencySupport },
          { label: 'Hospital Preference', value: enquiry?.stageDetails?.stage3?.hospitalPreference },
          { label: 'Total Amount', value: enquiry?.stageDetails?.stage3?.totalAmount },
          { label: 'Consent', value: enquiry?.stageDetails?.stage3?.consent },
          { label: 'Notes', value: enquiry?.stageDetails?.stage3?.notes },
        ],
      },
    ].filter((section) => {
      const hasFields = section.fields.some((field) => {
        if (Array.isArray(field.value)) return field.value.length > 0;
        return field.value !== undefined && field.value !== null && field.value !== '';
      });
      return section.savedAt || hasFields;
    });
  }, [enquiry]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    setDocumentUnavailable(false);
  }, [enquiryId]);

  const aadharDocument =
    enquiry?.documents?.aadharDocument ||
    enquiry?.stageDetails?.stage3?.aadharDocument ||
    enquiry?.['stageDetails.stage3']?.aadharDocument;
  const documentCandidates = useMemo(() => {
    const candidates = [enquiry, ...clientHistory];
    const seen = new Set();

    return candidates.filter((entry) => {
      const id = entry?._id || entry?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [clientHistory, enquiry]);

  if (!enquiry) return null;

  const handleOpenDocument = async () => {
    if (!enquiryId || isOpeningDocument || documentUnavailable) return;

    const documentWindow = window.open('', '_blank');
    const openDocumentUrl = (url) => {
      if (documentWindow) {
        documentWindow.location.href = url;
        return;
      }

      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    };

    try {
      setIsOpeningDocument(true);

      if (aadharDocument?.data && typeof aadharDocument.data === 'string') {
        openDocumentUrl(aadharDocument.data);
        return;
      }

      const localDocument = documentCandidates
        .map((entry) => (
          entry?.documents?.aadharDocument ||
          entry?.stageDetails?.stage3?.aadharDocument ||
          entry?.['stageDetails.stage3']?.aadharDocument
        ))
        .find((doc) => doc?.data && typeof doc.data === 'string');

      if (localDocument?.data) {
        openDocumentUrl(localDocument.data);
        return;
      }

      let response = null;
      for (const candidate of documentCandidates) {
        const candidateId = candidate?._id || candidate?.id;
        response = await fetch(`${API_URL}/api/enquiries/${candidateId}/document/aadhar`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.ok) break;
      }

      if (!response?.ok) {
        documentWindow?.close();

        if (response?.status === 404) {
          setDocumentUnavailable(true);
          alert('Document not found.');
          return;
        }

        throw new Error('Unable to open document');
      }

      const blob = await response.blob();
      const documentUrl = URL.createObjectURL(blob);

      openDocumentUrl(documentUrl);

      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60000);
    } catch (error) {
      documentWindow?.close();
      console.error('Failed to open document:', error);
      alert('Document not found.');
    } finally {
      setIsOpeningDocument(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...enquiry,
        ...formData,
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
      lead: enquiry.lead || enquiry.source || '',
      careType: enquiry.careType || '',
    });
    setIsEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl w-full sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Client ID</p>
            <div className="inline-block bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-mono font-bold text-sm sm:text-lg">
              {enquiry.clientId || 'N/A'}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
            {!isEditMode ? (
              <DetailGrid
                fields={[
                  { label: 'Patient Name', value: personalDetails.patientName },
                  { label: 'Family Name', value: personalDetails.familyName },
                  { label: 'Client Name', value: personalDetails.clientName },
                  { label: 'Age', value: personalDetails.age },
                  { label: 'Gender', value: personalDetails.gender },
                  { label: 'Guardian Name', value: personalDetails.guardianName },
                  { label: 'Relationship', value: personalDetails.guardianRelationship },
                  { label: 'Phone', value: personalDetails.phone },
                  { label: 'WhatsApp', value: personalDetails.whatsapp },
                  { label: 'Alternate Number', value: personalDetails.alternatePhone },
                  { label: 'Mail ID', value: personalDetails.email },
                  { label: 'Aadhaar', value: personalDetails.aadhaar },
                  { label: 'City / Area', value: personalDetails.city },
                  { label: 'Urgency', value: personalDetails.urgency },
                  { label: 'Telecaller', value: personalDetails.telecaller },
                  { label: 'Agent ID', value: personalDetails.agentId },
                ]}
              />
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

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Enquiry Details</h3>
            {!isEditMode ? (
              <DetailGrid
                fields={[
                  { label: 'Current Stage', value: enquiry.stage || '-' },
                  { label: 'Leads', value: enquiry.lead || enquiry.source || '-' },
                  { label: 'Care Type', value: enquiry.careType || '-' },
                  { label: 'Created Date', value: enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : '-' },
                ]}
              />
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
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Leads</label>
                  <select
                    name="lead"
                    value={formData.lead}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <optgroup label="Online">
                      <option value={ENQUIRY_LEADS.WEBSITE}>{ENQUIRY_LEADS.WEBSITE}</option>
                      <option value={ENQUIRY_LEADS.WHATSAPP}>{ENQUIRY_LEADS.WHATSAPP}</option>
                      <option value={ENQUIRY_LEADS.FACEBOOK}>{ENQUIRY_LEADS.FACEBOOK}</option>
                      <option value={ENQUIRY_LEADS.INSTAGRAM}>{ENQUIRY_LEADS.INSTAGRAM}</option>
                      <option value={ENQUIRY_LEADS.LINKEDIN}>{ENQUIRY_LEADS.LINKEDIN}</option>
                      <option value={ENQUIRY_LEADS.YELLOW_PAGE}>{ENQUIRY_LEADS.YELLOW_PAGE}</option>
                      <option value={ENQUIRY_LEADS.MAIL}>{ENQUIRY_LEADS.MAIL}</option>
                      <option value={ENQUIRY_LEADS.TAWK_TO}>{ENQUIRY_LEADS.TAWK_TO}</option>
                      <option value={ENQUIRY_LEADS.META_CAMPAIGNS}>{ENQUIRY_LEADS.META_CAMPAIGNS}</option>
                      <option value={ENQUIRY_LEADS.GOOGLE_CAMPAIGNS}>{ENQUIRY_LEADS.GOOGLE_CAMPAIGNS}</option>
                    </optgroup>
                    <optgroup label="Offline - Referral">
                      <option value={ENQUIRY_LEADS.OLD_CLIENTS}>{ENQUIRY_LEADS.OLD_CLIENTS}</option>
                      <option value={ENQUIRY_LEADS.EXISTING_CLIENTS}>{ENQUIRY_LEADS.EXISTING_CLIENTS}</option>
                    </optgroup>
                    <optgroup label="Offline - Professional">
                      <option value={ENQUIRY_LEADS.DOCTOR}>{ENQUIRY_LEADS.DOCTOR}</option>
                      <option value={ENQUIRY_LEADS.MEDICAL}>{ENQUIRY_LEADS.MEDICAL}</option>
                      <option value={ENQUIRY_LEADS.NURSE}>{ENQUIRY_LEADS.NURSE}</option>
                    </optgroup>
                    <optgroup label="Offline - Unprofessional">
                      <option value={ENQUIRY_LEADS.COMPOUNDER}>{ENQUIRY_LEADS.COMPOUNDER}</option>
                      <option value={ENQUIRY_LEADS.ELECTRICIAN}>{ENQUIRY_LEADS.ELECTRICIAN}</option>
                      <option value={ENQUIRY_LEADS.PLUMBER}>{ENQUIRY_LEADS.PLUMBER}</option>
                    </optgroup>
                    <optgroup label="Offline - Events & Stalls">
                      <option value={ENQUIRY_LEADS.CAMP}>{ENQUIRY_LEADS.CAMP}</option>
                      <option value={ENQUIRY_LEADS.STALL}>{ENQUIRY_LEADS.STALL}</option>
                      <option value={ENQUIRY_LEADS.EVENT}>{ENQUIRY_LEADS.EVENT}</option>
                    </optgroup>
                    <optgroup label="Offline - Business Partners">
                      <option value={ENQUIRY_LEADS.BUSINESS_PARTNERS}>{ENQUIRY_LEADS.BUSINESS_PARTNERS}</option>
                    </optgroup>
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

          {stageSections.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Stage-wise Details</h3>
              <div className="space-y-4">
                {stageSections.map((section) => (
                  <div key={section.key} className="rounded-lg border border-gray-200 p-4 sm:p-5 bg-gray-50">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">{section.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{formatDateTime(section.savedAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stageColors[section.title] || 'bg-white text-gray-700 border-gray-200'}`}>
                        {section.title}
                      </span>
                    </div>
                    <DetailGrid fields={section.fields} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {clientHistory && clientHistory.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Submission History ({clientHistory.length} submissions)
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {clientHistory.map((entry, index) => {
                  const colorClass = stageColors[entry.stage] || 'bg-gray-50 text-gray-700 border-gray-200';

                  return (
                    <div key={entry._id || entry.id} className={`p-4 sm:p-5 rounded-lg border ${colorClass}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm sm:text-base">
                            Submission #{index + 1}: <span className="font-bold">{entry.stage}</span>
                          </p>
                          <p className="text-xs sm:text-sm mt-1">
                            {formatDateTime(entry.createdAt)}
                          </p>
                        </div>
                        {index === clientHistory.length - 1 && (
                          <span className="ml-2 px-2 py-1 bg-white text-xs font-bold rounded-full">
                            LATEST
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-2 sm:gap-3 flex-shrink-0">
          {!isEditMode ? (
            <>
              <button
                onClick={handleOpenDocument}
                disabled={!enquiryId || isOpeningDocument || documentUnavailable}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {documentUnavailable ? 'No Document' : isOpeningDocument ? 'Opening...' : 'Open Document'}
              </button>
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
