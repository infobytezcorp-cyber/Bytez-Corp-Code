import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEnquiries } from '../../../features/enquirySlice';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import { StageProgressBar, Toast, SuccessScreen } from './LeadFormComponents';
import WhatsAppPrefillModal from '../WhatsAppPrefillModal';
import { WhatsAppIconButton } from './LeadFormComponents';
import { SRC_MAP, getServiceById } from './LeadFormConstants';

const API_URL = import.meta.env.VITE_API_URL || 'https://307c-2406-7400-ff03-198-9c9d-16ec-176f-1b18.ngrok-free.app';

const LeadForm = ({ initialAssignedToId, initialAgentName, initialPhone, onSaved }) => {
  const dispatch = useDispatch();

  // Form state
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    clientId: null,
    mongoId: null,
    s1: {},
    s2: {},
    s3: {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [assignedToId, setAssignedToId] = useState(null);

const openBusinessWhatsApp = async () => {
    const SANDBOX_NUMBER = import.meta.env.VITE_WHATSAPP_BUSINESS || '14155238886';
    const JOIN_CODE = import.meta.env.VITE_TWILIO_JOIN_CODE || 'join pictured-had';

 
    const elWhatsapp = document.getElementById('s1_whatsapp');
    const elPhone = document.getElementById('s1_phone');
    const phoneRaw = (elWhatsapp?.value || elPhone?.value || '').replace(/\D/g, '');

    const phoneToUse = phoneRaw || '';
    const prefillName = (document.getElementById('s1_pname')?.value) || formData.s1?.pname || 'WhatsApp Lead';
    const messageBody = JOIN_CODE; 

    try {
      if (phoneToUse) {
        
        const payload = {
          elderName: prefillName,
          phone: phoneToUse,
          notes: `Initiated via WhatsApp Sandbox button`,
          lead: 'WhatsApp',
          stage: 'New Enquiry',
          timeline: [{ event: 'Created via WhatsApp button', date: new Date().toISOString() }]
        };

        await fetch(`${API_URL}/api/enquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify(payload),
        });

        // Twilio Outbound Invite (Optional)
        try {
          await fetch(`${API_URL}/api/twilio/send-invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ phone: phoneToUse, message: `Hi ${prefillName}, welcome!` }),
          });
        } catch (err) {
          console.warn('send-invite failed', err);
        }
      }
    } catch (err) {
      console.error('WhatsApp button error', err);
    } finally {
      
      const waUrl = `https://wa.me/${SANDBOX_NUMBER}?text=${encodeURIComponent(messageBody)}`;
      window.open(waUrl, '_blank');
      setToast({ message: 'WhatsApp Sandbox chat opened', isError: false });
    }
  };

  // Update form data for a specific stage
  const handleUpdateFormData = useCallback((stageKey, data) => {
    setFormData((prev) => ({
      ...prev,
      [stageKey]: { ...prev[stageKey], ...data },
    }));
  }, []);

  // Save draft locally
  const handleSaveDraft = useCallback(() => {
    if (stage === 1) collectS1();
    if (stage === 2) collectS2();
    if (stage === 3) collectS3();
    setToast({ message: 'Draft saved locally.', isError: false });
  }, [stage, formData]);

  // Collect form data
  const collectS1 = () => {
    const s1Fields = {};
    ['pname', 'cname', 'age', 'gender', 'gname', 'grel', 'phone', 'whatsapp', 'altphone', 'email', 'aadhar', 'city', 'urgency', 'telecaller', 'agentid', 'service', 'source', 'createdDate'].forEach(
      (k) => {
        const el = document.getElementById(`s1_${k}`);
        if (el) s1Fields[k] = el.value || '';
      }
    );
    handleUpdateFormData('s1', s1Fields);
  };

  const collectS2 = () => {
    const s2Fields = {};
    ['condition', 'mobility', 'dependency', 'meds', 'allergy', 'hospital', 'diet', 'childname', 'childage', 'childcount', 'lang', 'feed', 'phours', 'specialnote', 'hhcount', 'hours', 'cookpref', 'pets', 'duties', 'startdate', 'duration', 'address', 'budget', 'decision', 'concerns', 'followup', 'status'].forEach(
      (k) => {
        const el = document.getElementById(`s2_${k}`);
        if (el) s2Fields[k] = el.value || '';
      }
    );
    s2Fields.diseases = [
      ...document.querySelectorAll('input[name="dis"]:checked'),
    ].map((x) => x.value);
    handleUpdateFormData('s2', s2Fields);
  };

  const collectS3 = () => {
    const s3Fields = {};
    ['startdate', 'enddate', 'careplan', 'visitfreq', 'emerg', 'hospital', 'total', 'consent', 'notes', 'enrollmentDate'].forEach(
      (k) => {
        const el = document.getElementById(`s3_${k}`);
        if (el) s3Fields[k] = el.value || '';
      }
    );
    // Get aadharDocument from state instead of DOM (it's stored as object, not form input)
    if (formData.s3?.aadharDocument) {
      s3Fields.aadharDocument = formData.s3.aadharDocument;
    }
    handleUpdateFormData('s3', s3Fields);
  };

  // Build API payloads
  const buildStage1Payload = () => {
    const d = formData.s1;
    const svcObj = getServiceById(d.service);
    const formattedPhone = d.phoneCountryCode ? `${d.phoneCountryCode}${d.phone}` : d.phone;

    if (d.aadhar && d.aadhar.replace(/\s/g, '').length !== 12) {
      throw new Error('Aadhar number must be exactly 12 digits');
    }

    return {
      elderName: d.pname,
      familyName: d.gname,
      phone: formattedPhone,
      aadhaar: d.aadhar ? d.aadhar.replace(/\s/g, '') : undefined,
      email: d.email?.trim() || '',
      careType: svcObj ? svcObj.label : '',
      lead: SRC_MAP[d.source] || d.source || '',
      stage: 'New Enquiry',
      personalDetails: {
        clientName: d.cname || '',
        age: d.age || '',
        gender: d.gender || '',
        guardianName: d.gname || '',
        guardianRelationship: d.grel || '',
        phone: formattedPhone || '',
        whatsapp: d.whatsapp || '',
        alternatePhone: d.altphone || '',
        email: d.email?.trim() || '',
        aadhaar: d.aadhar ? d.aadhar.replace(/\s/g, '') : '',
        city: d.city || '',
        urgency: d.urgency || '',
        telecaller: d.telecaller || '',
        agentId: d.agentid || '',
        createdDate: d.createdDate || '',
      },
      stageDetails: {
        stage1: {
          stageName: 'New Enquiry',
          savedAt: new Date().toISOString(),
          patientName: d.pname || '',
          clientName: d.cname || '',
          age: d.age || '',
          gender: d.gender || '',
          guardianName: d.gname || '',
          guardianRelationship: d.grel || '',
          phone: formattedPhone || '',
          whatsapp: d.whatsapp || '',
          alternatePhone: d.altphone || '',
          email: d.email?.trim() || '',
          aadhaar: d.aadhar ? d.aadhar.replace(/\s/g, '') : '',
          city: d.city || '',
          urgency: d.urgency || '',
          telecaller: d.telecaller || '',
          agentId: d.agentid || '',
          service: svcObj ? svcObj.label : '',
          leadSource: SRC_MAP[d.source] || d.source || '',
          createdDate: d.createdDate || '',
        },
      },
      notes: [
        d.cname ? `Client name: ${d.cname}` : '',
        d.grel ? `Guardian relationship: ${d.grel}` : '',
        d.email ? `Email: ${d.email.trim()}` : '',
        d.whatsapp ? `WhatsApp: ${d.whatsapp}` : '',
        d.altphone ? `Alternate phone: ${d.altphone}` : '',
        d.city ? `Location: ${d.city}` : '',
        d.urgency ? `Urgency: ${d.urgency}` : '',
        d.telecaller ? `Telecaller: ${d.telecaller}` : '',
        d.agentid ? `Agent ID: ${d.agentid}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
      timeline: [
        {
          event: `New Enquiry created via Lead Form`,
          date: new Date().toISOString(),
        },
      ],
      assignedTo: assignedToId || undefined,
      assignedAt: assignedToId ? new Date().toISOString() : undefined,
    };
  };

  const buildStage2Payload = () => {
    const d = formData.s2;
    const s1 = formData.s1;
    const notes = [];

    if (d.condition) notes.push(`Condition: ${d.condition}`);
    if (d.mobility) notes.push(`Mobility: ${d.mobility}`);
    if (d.dependency) notes.push(`Dependency: ${d.dependency}`);
    if (d.meds) notes.push(`Medications: ${d.meds}`);
    if (d.allergy) notes.push(`Allergies: ${d.allergy}`);
    if (d.hospital) notes.push(`Nearest hospital: ${d.hospital}`);
    if (d.diet) notes.push(`Diet: ${d.diet}`);
    if (d.diseases && d.diseases.length) notes.push(`Diseases: ${d.diseases.join(', ')}`);
    if (d.address) notes.push(`Address: ${d.address}`);
    if (d.budget) notes.push(`Budget: ${d.budget}`);
    if (d.concerns) notes.push(`Concerns: ${d.concerns}`);

    return {
      stage: 'Pitching',
      duration: d.duration || '',
      notes: notes.join(' | '),
      'stageDetails.stage2': {
        stageName: 'Pitching',
        savedAt: new Date().toISOString(),
        condition: d.condition || '',
        mobility: d.mobility || '',
        dependency: d.dependency || '',
        medications: d.meds || '',
        allergies: d.allergy || '',
        nearestHospital: d.hospital || '',
        diet: d.diet || '',
        diseases: d.diseases || [],
        childName: d.childname || '',
        childAge: d.childage || '',
        childCount: d.childcount || '',
        languagePreference: d.lang || '',
        feedingSupport: d.feed || '',
        patientHours: d.phours || '',
        specialNotes: d.specialnote || '',
        householdCount: d.hhcount || '',
        serviceHours: d.hours || '',
        cookingPreference: d.cookpref || '',
        pets: d.pets || '',
        duties: d.duties || '',
        preferredStartDate: d.startdate || '',
        duration: d.duration || '',
        address: d.address || '',
        budget: d.budget || '',
        decisionMaker: d.decision || '',
        concerns: d.concerns || '',
        followUp: d.followup || '',
        pitchStatus: d.status || '',
        service: getServiceById(s1.service)?.label || '',
      },
      timeline: [
        {
          event: `Stage updated to Pitching | Status: ${d.status || ''}`,
          date: new Date().toISOString(),
        },
      ],
    };
  };

  const buildStage3Payload = () => {
    const d = formData.s3;
    const notes = [];
    const startDate = d.startdate || formData.s2.startdate || '';

    if (d.careplan) notes.push(`Care plan: ${d.careplan}`);
    if (d.visitfreq) notes.push(`Visit frequency: ${d.visitfreq}`);
    if (d.consent) notes.push(`Consent: ${d.consent}`);
    if (d.notes) notes.push(d.notes);

    return {
      stage: 'Enrolled',
      notes: notes.join(' | '),
      'stageDetails.stage3': {
        stageName: 'Enrolled',
        savedAt: new Date().toISOString(),
        enrollmentDate: d.enrollmentDate || '',
        startDate,
        endDate: d.enddate || '',
        carePlan: d.careplan || '',
        visitFrequency: d.visitfreq || '',
        emergencySupport: d.emerg || '',
        hospitalPreference: d.hospital || '',
        totalAmount: d.total || '',
        consent: d.consent || '',
        aadharDocument: d.aadharDocument || null,
        notes: d.notes || '',
      },
      timeline: [
        {
          event: `Enrolled | Amount: ₹${d.total}`,
          date: new Date().toISOString(),
        },
      ],
    };
  };

  // API calls
  const handleSubmitStage1 = async () => {
    collectS1();
    const d = formData.s1;

    if (!d.pname?.trim()) {
      setToast({ message: 'Please enter Patient Name', isError: true });
      return;
    }
    if (!d.phone || d.phone.length < 10) {
      setToast({ message: 'Please enter a valid 10-digit phone number', isError: true });
      return;
    }
    if (!d.aadhar) {
      setToast({ message: 'Please enter Aadhar number', isError: true });
      return;
    }
    if (!d.source) {
      setToast({ message: 'Please select a Lead Source', isError: true });
      return;
    }
    if (!d.service) {
      setToast({ message: 'Please select a Service', isError: true });
      return;
    }

    setIsLoading(true);

    try {
      const payload = buildStage1Payload();
      let response;

      if (formData.mongoId) {
        response = await fetch(`${API_URL}/api/enquiries/${formData.mongoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/api/enquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${response.status}`);
      }

      const data = await response.json();
      const savedId = data._id || data.enquiry?._id;
      const clientId = data.clientId || data.enquiry?.clientId;

      setFormData((prev) => ({
        ...prev,
        mongoId: savedId,
        clientId: clientId,
      }));

      setToast({ message: `✓ Saved! Client ID: ${clientId}`, isError: false });
      setStage(2);
    } catch (err) {
      console.error('Stage 1 API error:', err);
      setToast({ message: `Save failed: ${err.message}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStage2 = async () => {
    collectS2();
    const d = formData.s2;

    if (!d.startdate) {
      setToast({ message: 'Please enter Preferred Start Date', isError: true });
      return;
    }
    if (!d.address) {
      setToast({ message: 'Please enter Service Address', isError: true });
      return;
    }
    if (!d.status) {
      setToast({ message: 'Please select Pitch Status', isError: true });
      return;
    }

    setIsLoading(true);

    try {
      const payload = buildStage2Payload();

      if (!formData.mongoId)
        throw new Error('No saved record found. Please go back to Stage 1.');

      const response = await fetch(`${API_URL}/api/enquiries/${formData.mongoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${response.status}`);
      }

      setToast({ message: '✓ Pitching stage saved!', isError: false });
      setStage(3);
    } catch (err) {
      console.error('Stage 2 API error:', err);
      setToast({ message: `Save failed: ${err.message}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStage3 = async () => {
    collectS3();
    const d = formData.s3;

    if (!d.total || parseFloat(d.total) <= 0) {
      setToast({ message: 'Please enter Total Package Amount', isError: true });
      return;
    }
    if (!d.consent) {
      setToast({ message: 'Please select Guardian Consent status', isError: true });
      return;
    }

    setIsLoading(true);

    try {
      const payload = buildStage3Payload();

      if (!formData.mongoId)
        throw new Error('No saved record found. Please go back to Stage 1.');

      const response = await fetch(`${API_URL}/api/enquiries/${formData.mongoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${response.status}`);
      }

      setToast({ message: '✓ Enrollment confirmed!', isError: false });
      setStage(4);
      
      // Refresh enquiries list after successful enrollment
      setTimeout(() => {
        dispatch(fetchEnquiries());
        try {
          if (onSaved) onSaved({ mongoId: formData.mongoId, status: 'enrolled' });
        } catch (err) {
          // ignore
        }
      }, 1000);
    } catch (err) {
      console.error('Stage 3 API error:', err);
      setToast({ message: `Save failed: ${err.message}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      clientId: null,
      mongoId: null,
      s1: {},
      s2: {},
      s3: {},
    });
    setStage(1);
  };

  // Render stages
  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <Stage1
            formData={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleSubmitStage1}
            savedClientId={formData.clientId}
            isLoading={isLoading}
            onSaveDraft={handleSaveDraft}
          />
        );
      case 2:
        return (
          <Stage2
            formData={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleSubmitStage2}
            isLoading={isLoading}
            onSaveDraft={handleSaveDraft}
          />
        );
      case 3:
        return (
          <Stage3
            formData={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleSubmitStage3}
            isLoading={isLoading}
            onSaveDraft={handleSaveDraft}
          />
        );
      case 4:
        return (
          <SuccessScreen
            formData={formData}
            serviceLabel={getServiceById(formData.s1?.service)?.label}
            onNewLead={handleResetForm}
          />
        );
      default:
        return null;
    }
  };

  // Read URL params for prefill (agent invoked from telecaller workspace)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const agentId = params.get('agentId');
      const agentName = params.get('agentName');
      const phone = params.get('phone');

      if (agentId) setAssignedToId(agentId);

      if (agentId || agentName || phone) {
        setFormData((prev) => ({
          ...prev,
          s1: {
            ...prev.s1,
            agentid: agentId || prev.s1.agentid,
            telecaller: agentName || prev.s1.telecaller,
            phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : prev.s1.phone,
          },
        }));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Prefill from props (when rendered inside telecaller modal)
  useEffect(() => {
    if (initialAssignedToId || initialAgentName || initialPhone) {
      if (initialAssignedToId) setAssignedToId(initialAssignedToId);
      setFormData((prev) => ({
        ...prev,
        s1: {
          ...prev.s1,
          agentid: initialAssignedToId || prev.s1.agentid,
          telecaller: initialAgentName || prev.s1.telecaller,
          phone: initialPhone ? String(initialPhone).replace(/\D/g, '').slice(-10) : prev.s1.phone,
        },
      }));
    }
  }, [initialAssignedToId, initialAgentName, initialPhone]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-white px-3 py-6 text-stone-900 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-[680px]">
        {/* Organization Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900">
            <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="13" cy="8" r="4" fill="#A8DBBF" />
              <path
                d="M4 22c0-4.97 4.03-9 9-9s9 4.03 9 9"
                stroke="#A8DBBF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13 14v8M10 18h6"
                stroke="#3A9467"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-semibold leading-tight text-emerald-950">
              Thatha Patti Elders Foundation
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
              Lead Entry Form
            </div>
          </div>
          <div className="ml-auto">
            <WhatsAppIconButton onClick={openBusinessWhatsApp} />
          </div>
        </div>

        {/* Progress Bar */}
        {stage < 4 && <StageProgressBar currentStage={stage} />}

        {/* Form Content */}
        {renderStage()}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            isError={toast.isError}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default LeadForm;
