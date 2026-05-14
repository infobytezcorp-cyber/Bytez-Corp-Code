import React, { useState } from 'react';
import {
  CardHeader,
  CardFooter,
  Section,
  FormGroup,
  FormInput,
  FormSelect,
  ApiBanner,
} from './LeadFormComponents';
import { SVCS_HOME, SVCS_HEALTH, SRCS } from './LeadFormConstants';

const Stage1 = ({
  formData,
  onUpdate,
  onNext,
  savedClientId,
  isLoading,
  onSaveDraft,
}) => {
  const [errors, setErrors] = useState({});

  const normalizeDigits = (value) => String(value).replace(/\D/g, '');

  const handleFieldChange = (field, value) => {
    let normalizedValue = value;

    if (['phone', 'whatsapp', 'altphone'].includes(field)) {
      normalizedValue = normalizeDigits(value).slice(0, 10);
    }

    if (field === 'aadhar') {
      normalizedValue = normalizeDigits(value).slice(0, 12);
    }

    onUpdate('s1', { ...formData.s1, [field]: normalizedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleServiceSelect = (serviceId) => {
    onUpdate('s1', { ...formData.s1, service: serviceId });
  };

  const handleSourceSelect = (sourceId) => {
    onUpdate('s1', { ...formData.s1, source: sourceId });
  };

  const validate = () => {
    const newErrors = {};
    const d = formData.s1;

    if (!d.pname?.trim()) newErrors.pname = 'Patient Name is required';
    if (!d.phone || d.phone.length !== 10) newErrors.phone = 'Valid 10-digit phone required';
    if (!d.aadhar) newErrors.aadhar = 'Aadhar number is required';
    if (d.aadhar && d.aadhar.replace(/\s/g, '').length !== 12) newErrors.aadhar = 'Aadhar must be 12 digits';
    if (!d.source) newErrors.source = 'Lead Source is required';
    if (!d.service) newErrors.service = 'Service is required';
    if (!d.gender) newErrors.gender = 'Gender is required';
    if (!d.gname?.trim()) newErrors.gname = 'Guardian Name is required';
    if (!d.grel) newErrors.grel = 'Guardian Relationship is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const urgencyOptions =
    formData.s1.service && ['en12', 'en24', 'dah', 'amb'].includes(formData.s1.service)
      ? ['Emergency - immediately', 'Within 24 hrs', 'Within a week', 'Just enquiring']
      : ['Immediately', 'Within a week', 'Within a month', 'Just enquiring'];

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  // input[type=date] requires yyyy-MM-dd format
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const tagClass = (selected) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${
      selected
        ? 'border-emerald-800 bg-emerald-800 text-white'
        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <CardHeader stage={1} title="New Lead" subtitle="Patient basic information and lead source" />
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7">
        {savedClientId && <ApiBanner type="success" message={`Saved - Client ID: ${savedClientId}`} />}

        <Section icon="1" title="Patient basic information">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="Patient Name" required>
              <FormInput
                id="s1_pname"
                placeholder="Full name"
                value={formData.s1?.pname}
                onChange={(e) => handleFieldChange('pname', e.target.value)}
                required
              />
              {errors.pname && <small className="text-rose-600">{errors.pname}</small>}
            </FormGroup>

            <FormGroup label="Client Name">
              <FormInput
                id="s1_cname"
                placeholder="Client full name"
                value={formData.s1?.cname}
                onChange={(e) => handleFieldChange('cname', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Age" required>
              <FormInput
                id="s1_age"
                type="number"
                placeholder="Years"
                value={formData.s1?.age}
                onChange={(e) => handleFieldChange('age', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup label="Gender" required>
              <FormSelect
                id="s1_gender"
                options={['Male', 'Female', 'Other']}
                value={formData.s1?.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                required
              />
              {errors.gender && <small className="text-rose-600">{errors.gender}</small>}
            </FormGroup>

            <FormGroup label="Guardian Name" required>
              <FormInput
                id="s1_gname"
                placeholder="Full name"
                value={formData.s1?.gname}
                onChange={(e) => handleFieldChange('gname', e.target.value)}
                required
              />
              {errors.gname && <small className="text-rose-600">{errors.gname}</small>}
            </FormGroup>

            <FormGroup label="Relationship" required>
              <FormSelect
                id="s1_grel"
                options={['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Wife', 'Husband', 'Other']}
                value={formData.s1?.grel}
                onChange={(e) => handleFieldChange('grel', e.target.value)}
                required
              />
              {errors.grel && <small className="text-rose-600">{errors.grel}</small>}
            </FormGroup>

            <FormGroup label="Contact Number" required>
              <div className="flex gap-2">
                <select
                  id="s1_phoneCountryCode"
                  value={formData.s1?.phoneCountryCode || '+91'}
                  onChange={(e) => handleFieldChange('phoneCountryCode', e.target.value)}
                  className=" rounded-xl border border-stone-300 bg-white text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {[
                      { label: '+91' },
                      { label: '+1' },
                      { label: '+44' },
                      { label: '+61' },
                      { label: '+971' },
                    ].map((code) => (
                      <option key={code.label} value={code.label}>
                        {code.label}
                      </option>
                    ))}
                </select>
                <FormInput
                  id="s1_phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.s1?.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  required
                />
              </div>
              {errors.phone && <small className="text-rose-600">{errors.phone}</small>}
            </FormGroup>

            <FormGroup label="WhatsApp Number">
              <FormInput
                id="s1_whatsapp"
                type="tel"
                placeholder="10-digit WhatsApp"
                inputMode="numeric"
                maxLength={10}
                value={formData.s1?.whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Alternate Number">
              <FormInput
                id="s1_altphone"
                type="tel"
                placeholder="Optional"
                inputMode="numeric"
                maxLength={10}
                value={formData.s1?.altphone}
                
                onChange={(e) => handleFieldChange('altphone', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Mail ID">
              <FormInput
                id="s1_email"
                type="email"
                placeholder="name@example.com"
                value={formData.s1?.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Aadhar Number" required>
              <FormInput
                id="s1_aadhar"
                placeholder="XXXX XXXX XXXX"
                inputMode="numeric"
                maxLength={12}
                value={formData.s1?.aadhar}
                onChange={(e) => handleFieldChange('aadhar', e.target.value)}
                required
              />
              {errors.aadhar && <small className="text-rose-600">{errors.aadhar}</small>}
            </FormGroup>

            <FormGroup label="City / Area" required>
              <FormInput
                id="s1_city"
                placeholder="Patient location"
                value={formData.s1?.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                required
              />
            </FormGroup>
          </div>
        </Section>

        <Section icon="2" title="Service selection">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Home Care</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {SVCS_HOME.map((svc) => (
              <button
                key={svc.id}
                type="button"
                className={tagClass(formData.s1?.service === svc.id)}
                onClick={() => handleServiceSelect(svc.id)}
              >
                {svc.label}
              </button>
            ))}
          </div>

          <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Health Care</div>
          <div className="flex flex-wrap gap-2">
            {SVCS_HEALTH.map((svc) => (
              <button
                key={svc.id}
                type="button"
                className={tagClass(formData.s1?.service === svc.id)}
                onClick={() => handleServiceSelect(svc.id)}
              >
                {svc.label}
              </button>
            ))}
          </div>
          {errors.service && <small className="text-rose-600">{errors.service}</small>}
        </Section>

        <Section icon="3" title="Lead information">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="When Needed" required>
              <FormSelect
                id="s1_urgency"
                options={urgencyOptions}
                value={formData.s1?.urgency}
                onChange={(e) => handleFieldChange('urgency', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup label="Telecaller Name" required>
              <FormInput
                id="s1_telecaller"
                placeholder="Your name"
                value={formData.s1?.telecaller}
                onChange={(e) => handleFieldChange('telecaller', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup label="Agent ID">
              <FormInput
                id="s1_agentid"
                placeholder="Agent ID"
                value={formData.s1?.agentid}
                onChange={(e) => handleFieldChange('agentid', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Lead Created Date" required>
              <FormInput
                id="s1_createdDate"
                type="date"
                value={formData.s1?.createdDate || today}
                onChange={(e) => handleFieldChange('createdDate', e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup label="Lead Source" required>
            <div className="mt-1 grid grid-cols-2 gap-2 md:grid-cols-3">
              {SRCS.map((src) => {
                const selected = formData.s1?.source === src.id;
                return (
                  <button
                    type="button"
                    key={src.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                      selected
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white'
                    }`}
                    onClick={() => handleSourceSelect(src.id)}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: src.color }}
                    />
                    <span className={`text-sm ${selected ? 'font-medium text-emerald-800' : 'text-stone-700'}`}>
                      {src.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.source && <small className="text-rose-600">{errors.source}</small>}
          </FormGroup>
        </Section>
      </div>

      <CardFooter
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        buttonLabel="Save & Pitching ->"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Stage1;
