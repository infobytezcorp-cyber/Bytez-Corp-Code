import React, { useState } from 'react';
import {
  CardHeader,
  CardFooter,
  Section,
  FormGroup,
  FormInput,
  FormSelect,
  FormTextarea,
} from './LeadFormComponents';
import { getSvcType, getServiceById } from './LeadFormConstants';

const Stage3 = ({ formData, onUpdate, onNext, isLoading, onSaveDraft }) => {
  const [errors, setErrors] = useState({});
  const s1 = formData.s1 || {};
  const s2 = formData.s2 || {};
  const s3 = formData.s3 || {};
  const stype = getSvcType(s1.service);
  const svcObj = getServiceById(s1.service);

  const handleFieldChange = (field, value) => {
    onUpdate('s3', { ...s3, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store file as base64
        handleFieldChange(field, {
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    const startDate = s3.startdate || s2.startdate || '';

    if (!s3.total || parseFloat(s3.total) <= 0) newErrors.total = 'Total amount is required';
    if (!s3.consent) newErrors.consent = 'Guardian Consent is required';
    if (!startDate) newErrors.startdate = 'Service Start Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <CardHeader stage={3} title="Enrollment" subtitle="Finalize contract, payment and documents" />
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7">
        <Section icon="1" title="Enrollment summary">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-600">
            <div>
              Patient:{' '}
              <span className="font-semibold text-stone-900">{s1.pname || '-'}</span>
            </div>
            <div>
              Service:{' '}
              <span className="font-semibold text-stone-900">{svcObj ? svcObj.label : '-'}</span>
            </div>
            <div>
              Address:{' '}
              <span className="font-semibold text-stone-900">{s2.address || '-'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="Enrollment Date" required>
              <FormInput
                id="s3_enrollmentDate"
                type="date"
                value={formData.s3?.enrollmentDate || today}
                onChange={(e) => handleFieldChange('enrollmentDate', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Client ID" required>
              <FormInput value={formData.clientId || 'Auto-generated'} readOnly />
            </FormGroup>

            <FormGroup label="Service Start Date" required>
              <FormInput
                id="s3_startdate"
                type="date"
                value={s3.startdate || s2.startdate || ''}
                onChange={(e) => handleFieldChange('startdate', e.target.value)}
                required
              />
              {errors.startdate && <small className="text-rose-600">{errors.startdate}</small>}
            </FormGroup>

            <FormGroup label="Service End Date">
              <FormInput
                id="s3_enddate"
                type="date"
                value={s3.enddate}
                onChange={(e) => handleFieldChange('enddate', e.target.value)}
              />
            </FormGroup>
          </div>
        </Section>

        {(stype === 'medical' || stype === 'emergency') && (
          <Section icon="2" title="Care plan">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormGroup label="Care Plan Prepared" required>
                <FormSelect
                  id="s3_careplan"
                  options={['Yes', 'No', 'In progress']}
                  value={s3.careplan}
                  onChange={(e) => handleFieldChange('careplan', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Visiting Frequency" required>
                <FormSelect
                  id="s3_visitfreq"
                  options={['Daily', 'Alternate days', 'Weekly', 'On-call']}
                  value={s3.visitfreq}
                  onChange={(e) => handleFieldChange('visitfreq', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Emergency Protocol Noted" required>
                <FormSelect
                  id="s3_emerg"
                  options={['Yes', 'No']}
                  value={s3.emerg}
                  onChange={(e) => handleFieldChange('emerg', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Nearest Hospital">
                <FormInput
                  id="s3_hospital"
                  placeholder="For emergencies"
                  value={s3.hospital || s2.hospital}
                  onChange={(e) => handleFieldChange('hospital', e.target.value)}
                />
              </FormGroup>
            </div>
          </Section>
        )}

        <Section icon="3" title="Payment details">
          <div className="grid grid-cols-1 gap-3">
            <FormGroup label="Total Package Amount (Rs)" required>
              <FormInput
                id="s3_total"
                type="number"
                placeholder="0"
                value={s3.total}
                onChange={(e) => handleFieldChange('total', e.target.value)}
                required
              />
              {errors.total && <small className="text-rose-600">{errors.total}</small>}
            </FormGroup>
          </div>
        </Section>

        <Section icon="4" title="Documents and consent">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="Guardian Consent Obtained" required>
              <FormSelect
                id="s3_consent"
                options={['Yes', 'No']}
                value={s3.consent}
                onChange={(e) => handleFieldChange('consent', e.target.value)}
                required
              />
              {errors.consent && <small className="text-rose-600">{errors.consent}</small>}
            </FormGroup>

            <FormGroup label="Aadhar Document">
              <div className="flex items-center gap-2">
                <input
                  id="s3_aadharDoc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => handleFileUpload('aadharDocument', e.target.files?.[0])}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition file:bg-emerald-50 file:border-0 file:px-2 file:py-1 file:text-emerald-700 file:cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              {s3.aadharDocument && (
                <small className="text-emerald-600 flex items-center gap-1 mt-1">
                  ✓ {s3.aadharDocument.name}
                </small>
              )}
            </FormGroup>

            <FormGroup label="Special Instructions / Notes" full>
              <FormTextarea
                id="s3_notes"
                placeholder="Any extra instructions"
                value={s3.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
              />
            </FormGroup>
          </div>
        </Section>
      </div>

      <CardFooter
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        buttonLabel="Confirm Enrollment"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Stage3;
