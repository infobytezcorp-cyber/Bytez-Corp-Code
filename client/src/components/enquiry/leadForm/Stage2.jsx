import React, { useState } from 'react';
import {
  CardHeader,
  CardFooter,
  Section,
  FormGroup,
  FormInput,
  FormSelect,
  FormTextarea,
  Notice,
} from './LeadFormComponents';
import { getSvcType, getServiceById } from './LeadFormConstants';

const Stage2 = ({ formData, onUpdate, onNext, isLoading, onSaveDraft }) => {
  const [errors, setErrors] = useState({});
  const s1 = formData.s1 || {};
  const s2 = formData.s2 || {};
  const stype = getSvcType(s1.service);
  const svcObj = getServiceById(s1.service);

  const handleFieldChange = (field, value) => {
    onUpdate('s2', { ...s2, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleDiseasesChange = (disease, checked) => {
    const diseases = s2.diseases || [];
    const updated = checked
      ? [...diseases, disease]
      : diseases.filter((item) => item !== disease);
    onUpdate('s2', { ...s2, diseases: updated });
  };

  const validate = () => {
    const newErrors = {};

    if (!s2.startdate) newErrors.startdate = 'Preferred Start Date is required';
    if (!s2.address?.trim()) newErrors.address = 'Service Address is required';
    if (!s2.status) newErrors.status = 'Pitch Status is required';
    if (!s2.followup) newErrors.followup = 'Follow-up Date is required';
    if (!s2.decision) newErrors.decision = 'Decision Maker is required';

    if (stype === 'medical' || stype === 'emergency') {
      if (!s2.mobility) newErrors.mobility = 'Mobility Status is required';
      if (stype === 'emergency' && !s2.dependency) {
        newErrors.dependency = 'Dependency Level is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const noticeMap = {
    medical: {
      type: 'info',
      text: 'Medical service - patient health and condition details required below.',
    },
    emergency: {
      type: 'danger',
      text: 'Emergency service - hospital info and dependency level are critical.',
    },
    household: {
      type: 'warning',
      text: 'Household service - no medical fields. Focus on home schedule.',
    },
    baby: {
      type: 'warning',
      text: 'Baby sitting service - child details and schedule required.',
    },
  };
  const notice = noticeMap[stype] || noticeMap.medical;

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <CardHeader
        stage={2}
        title="Pitching"
        subtitle={`${s1.pname || 'Patient'} · ${svcObj ? svcObj.label : 'No service selected'}`}
      />
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7">
        <Notice type={notice.type} message={notice.text} />

        {(stype === 'medical' || stype === 'emergency') && (
          <Section icon="1" title="Health and condition details">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormGroup label="Current Health Condition" required full>
                <FormTextarea
                  id="s2_condition"
                  placeholder="Patient's current health status"
                  value={s2.condition}
                  onChange={(e) => handleFieldChange('condition', e.target.value)}
                />
                {errors.condition && <small className="text-rose-600">{errors.condition}</small>}
              </FormGroup>

              <FormGroup label="Mobility Status" required>
                <FormSelect
                  id="s2_mobility"
                  options={['Fully mobile', 'Partially mobile', 'Bed-ridden']}
                  value={s2.mobility}
                  onChange={(e) => handleFieldChange('mobility', e.target.value)}
                  required
                />
                {errors.mobility && <small className="text-rose-600">{errors.mobility}</small>}
              </FormGroup>

              {stype === 'emergency' && (
                <FormGroup label="Dependency Level" required>
                  <FormSelect
                    id="s2_dependency"
                    options={['Independent', 'Needs assistance', 'Fully dependent']}
                    value={s2.dependency}
                    onChange={(e) => handleFieldChange('dependency', e.target.value)}
                    required
                  />
                  {errors.dependency && <small className="text-rose-600">{errors.dependency}</small>}
                </FormGroup>
              )}

              <FormGroup label="Current Medications">
                <FormInput
                  id="s2_meds"
                  placeholder="List medicines"
                  value={s2.meds}
                  onChange={(e) => handleFieldChange('meds', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Allergies">
                <FormInput
                  id="s2_allergy"
                  placeholder="Any known allergies"
                  value={s2.allergy}
                  onChange={(e) => handleFieldChange('allergy', e.target.value)}
                />
              </FormGroup>

              {stype === 'emergency' && (
                <FormGroup label="Nearest Hospital" required>
                  <FormInput
                    id="s2_hospital"
                    placeholder="For emergencies"
                    value={s2.hospital}
                    onChange={(e) => handleFieldChange('hospital', e.target.value)}
                    required
                  />
                  {errors.hospital && <small className="text-rose-600">{errors.hospital}</small>}
                </FormGroup>
              )}

              <FormGroup label="Special Diet / Restrictions">
                <FormInput
                  id="s2_diet"
                  placeholder="Any food restrictions"
                  value={s2.diet}
                  onChange={(e) => handleFieldChange('diet', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Existing Diseases" full>
                <div className="flex flex-wrap gap-2">
                  {['Diabetes', 'High BP', 'Dementia', 'Post-surgery', 'Paralysis', 'Cancer', 'Other'].map(
                    (disease) => {
                      const checked = (s2.diseases || []).includes(disease);
                      return (
                        <label
                          key={disease}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                            checked
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="dis"
                            value={disease}
                            checked={checked}
                            onChange={(e) => handleDiseasesChange(disease, e.target.checked)}
                            className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500"
                          />
                          {disease}
                        </label>
                      );
                    }
                  )}
                </div>
              </FormGroup>
            </div>
          </Section>
        )}

        {stype === 'baby' && (
          <Section icon="2" title="Child details">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormGroup label="Child's Name" required>
                <FormInput
                  id="s2_childname"
                  placeholder="Enter child name"
                  value={s2.childname}
                  onChange={(e) => handleFieldChange('childname', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Child's Age" required>
                <FormSelect
                  id="s2_childage"
                  options={['0-6 months', '6-12 months', '1-2 years', '2-5 years', '5+ years']}
                  value={s2.childage}
                  onChange={(e) => handleFieldChange('childage', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Number of Children" required>
                <FormSelect
                  id="s2_childcount"
                  options={['1', '2', '3+']}
                  value={s2.childcount}
                  onChange={(e) => handleFieldChange('childcount', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Preferred Language">
                <FormSelect
                  id="s2_lang"
                  options={['Tamil', 'English', 'Both ok']}
                  value={s2.lang}
                  onChange={(e) => handleFieldChange('lang', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Feeding Schedule">
                <FormInput
                  id="s2_feed"
                  placeholder="Timing and food type"
                  value={s2.feed}
                  onChange={(e) => handleFieldChange('feed', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Parents' Work Hours">
                <FormInput
                  id="s2_phours"
                  placeholder="Work timing"
                  value={s2.phours}
                  onChange={(e) => handleFieldChange('phours', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Special Instructions" required full>
                <FormTextarea
                  id="s2_specialnote"
                  placeholder="Any special care needed"
                  value={s2.specialnote}
                  onChange={(e) => handleFieldChange('specialnote', e.target.value)}
                />
              </FormGroup>
            </div>
          </Section>
        )}

        {stype === 'household' && (
          <Section icon="2" title="Household details">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormGroup label="People in Household" required>
                <FormSelect
                  id="s2_hhcount"
                  options={['1', '2', '3-4', '5+']}
                  value={s2.hhcount}
                  onChange={(e) => handleFieldChange('hhcount', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Preferred Working Hours" required>
                <FormSelect
                  id="s2_hours"
                  options={['Morning (6am-12pm)', 'Afternoon (12pm-6pm)', 'Evening (6pm-10pm)', 'Flexible']}
                  value={s2.hours}
                  onChange={(e) => handleFieldChange('hours', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Cooking Preference">
                <FormSelect
                  id="s2_cookpref"
                  options={['Veg only', 'Non-veg ok', 'Jain', 'No cooking needed']}
                  value={s2.cookpref}
                  onChange={(e) => handleFieldChange('cookpref', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Pets at Home">
                <FormSelect
                  id="s2_pets"
                  options={['Yes', 'No']}
                  value={s2.pets}
                  onChange={(e) => handleFieldChange('pets', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Specific Duties Expected" required full>
                <FormTextarea
                  id="s2_duties"
                  placeholder="List the duties expected from staff"
                  value={s2.duties}
                  onChange={(e) => handleFieldChange('duties', e.target.value)}
                  required
                />
              </FormGroup>
            </div>
          </Section>
        )}

        <Section icon="3" title="Service logistics">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="Preferred Start Date" required>
              <FormInput
                id="s2_startdate"
                type="date"
                value={s2.startdate}
                onChange={(e) => handleFieldChange('startdate', e.target.value)}
                required
              />
              {errors.startdate && <small className="text-rose-600">{errors.startdate}</small>}
            </FormGroup>

            <FormGroup label="Service Duration" required>
              <FormSelect
                id="s2_duration"
                options={['1 week', '15 days', '1 month', '3 months', 'Long-term']}
                value={s2.duration}
                onChange={(e) => handleFieldChange('duration', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup label="Service Address" required full>
              <FormTextarea
                id="s2_address"
                placeholder="Full address where care is required"
                value={s2.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                required
              />
              {errors.address && <small className="text-rose-600">{errors.address}</small>}
            </FormGroup>
          </div>
        </Section>

        <Section icon="4" title="Budget and decision">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormGroup label="Budget Range">
              <FormSelect
                id="s2_budget"
                options={['Below Rs 5,000', 'Rs 5,000-Rs 10,000', 'Rs 10,000-Rs 20,000', 'Above Rs 20,000']}
                value={s2.budget}
                onChange={(e) => handleFieldChange('budget', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Decision Maker" required>
              <FormSelect
                id="s2_decision"
                options={['Same as guardian', 'Spouse', 'Child', 'Other']}
                value={s2.decision}
                onChange={(e) => handleFieldChange('decision', e.target.value)}
                required
              />
              {errors.decision && <small className="text-rose-600">{errors.decision}</small>}
            </FormGroup>

            <FormGroup label="Concerns / Objections" full>
              <FormTextarea
                id="s2_concerns"
                placeholder="Note any questions or objections raised"
                value={s2.concerns}
                onChange={(e) => handleFieldChange('concerns', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Follow-up Date" required>
              <FormInput
                id="s2_followup"
                type="date"
                value={s2.followup}
                onChange={(e) => handleFieldChange('followup', e.target.value)}
                required
              />
              {errors.followup && <small className="text-rose-600">{errors.followup}</small>}
            </FormGroup>

            <FormGroup label="Pitch Status" required>
              <FormSelect
                id="s2_status"
                options={['Interested', 'Need time', 'Not interested', 'Callback needed']}
                value={s2.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                required
              />
              {errors.status && <small className="text-rose-600">{errors.status}</small>}
            </FormGroup>
          </div>
        </Section>
      </div>

      <CardFooter
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        buttonLabel="Save & Enrolled ->"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Stage2;
