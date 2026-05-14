import React from 'react';

const inputBaseClassName =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 read-only:bg-stone-100 read-only:text-stone-500 read-only:focus:border-stone-300 read-only:focus:ring-0';

const noticeStyles = {
  info: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
};

const apiBannerStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  loading: 'border-sky-200 bg-sky-50 text-sky-900',
};

const actionButtonStyles = {
  default:
    'border-stone-300 bg-white text-stone-700 hover:bg-stone-100',
  primary:
    'border-emerald-800 bg-emerald-800 text-white hover:border-emerald-700 hover:bg-emerald-700',
  amber:
    'border-amber-700 bg-amber-700 text-white hover:border-amber-800 hover:bg-amber-800',
  success:
    'border-emerald-600 bg-emerald-600 text-white hover:border-emerald-500 hover:bg-emerald-500',
};

export const Toast = ({ message, isError, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl transition ${
        isError ? 'bg-rose-600' : 'bg-stone-900'
      }`}
    >
      {message}
    </div>
  );
};

export const FormLabel = ({ label, required = false }) => (
  <label className="flex items-center gap-1 text-sm font-medium text-stone-700">
    <span>{label}</span>
    {required ? (
      <span className="text-xs text-rose-600">*</span>
    ) : (
      <span className="text-xs font-normal text-stone-400">optional</span>
    )}
  </label>
);

export const FormInput = ({
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  readOnly = false,
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value || ''}
    onChange={onChange}
    required={required}
    readOnly={readOnly}
    className={inputBaseClassName}
  />
);

export const FormSelect = ({ id, options, value, onChange, required = false }) => (
  <select
    id={id}
    value={value || ''}
    onChange={onChange}
    required={required}
    className={inputBaseClassName}
  >
    <option value="">Select...</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

export const FormTextarea = ({
  id,
  placeholder = '',
  value,
  onChange,
  required = false,
}) => (
  <textarea
    id={id}
    placeholder={placeholder}
    value={value || ''}
    onChange={onChange}
    required={required}
    className={`${inputBaseClassName} min-h-[88px] resize-y`}
  />
);

export const FormGroup = ({ label, required = false, children, full = false }) => (
  <div className={full ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
    <FormLabel label={label} required={required} />
    {children}
  </div>
);

export const Section = ({ icon, title, children }) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-sm">
        {icon}
      </span>
      <span>{title}</span>
    </div>
    {children}
  </section>
);

export const Notice = ({ type = 'info', message }) => (
  <div
    className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
      noticeStyles[type] || noticeStyles.info
    }`}
  >
    {message}
  </div>
);

export const ApiBanner = ({ type, message }) => (
  <div
    className={`rounded-xl border px-4 py-3 text-sm font-medium ${
      apiBannerStyles[type] || apiBannerStyles.success
    }`}
  >
    {message}
  </div>
);

export const StageProgressBar = ({ currentStage }) => {
  const labels = ['New Lead', 'Pitching', 'Enrolled'];

  return (
    <div className="mb-7 flex items-start">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < currentStage;
        const active = stepNumber === currentStage;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex min-w-[90px] flex-col items-center gap-2 text-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                      ? 'border-emerald-800 bg-emerald-800 text-white ring-4 ring-emerald-100'
                      : 'border-stone-300 bg-white text-stone-400'
                }`}
              >
                {done ? '✓' : stepNumber}
              </div>
              <div
                className={`text-xs font-medium ${
                  active ? 'text-emerald-800' : done ? 'text-emerald-600' : 'text-stone-400'
                }`}
              >
                {label}
              </div>
            </div>
            {index < labels.length - 1 && (
              <div className="flex flex-1 items-center px-2 pt-4">
                <div
                  className={`h-0.5 w-full rounded ${
                    stepNumber < currentStage ? 'bg-emerald-400' : 'bg-stone-200'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export function WhatsAppIconButton({ onClick }) {
  return (
    <button onClick={onClick} title="Send via WhatsApp" className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      WhatsApp
    </button>
  );
}

export const CardHeader = ({ stage, title, subtitle }) => (
  <div className="border-b border-stone-200 bg-stone-50 px-5 py-5 sm:px-7">
    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
      Stage {stage} of 3
    </div>
    <div className="text-2xl font-semibold text-stone-900 sm:text-[28px]">{title}</div>
    <div className="mt-1 text-sm text-stone-500">{subtitle}</div>
  </div>
);

export const CardFooter = ({ onSaveDraft, onNext, buttonLabel, isLoading }) => {
  const variant = buttonLabel.includes('Pitching')
    ? 'primary'
    : buttonLabel.includes('Enrolled')
      ? 'amber'
      : 'success';

  return (
    <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <span className="text-xs text-stone-500">Fill all required (*) fields to proceed</span>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${actionButtonStyles.default}`}
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          Save draft
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${actionButtonStyles[variant]}`}
          onClick={onNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              <span>Saving...</span>
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
};

export const SuccessScreen = ({ formData, serviceLabel, onNewLead }) => (
  <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
    <div className="px-5 py-8 sm:px-7 sm:py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>
        <div className="text-3xl font-semibold text-stone-900">Client Enrolled!</div>
        <div className="mt-2 text-sm text-stone-500">
          Lead saved and enrollment confirmed in the system.
        </div>
        <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-left">
          {[
            ['Patient', formData.s1?.pname || '-'],
            ['Service', serviceLabel || '-'],
            ['Client ID', formData.clientId || '-'],
            ['Phone', formData.s1?.phone || '-'],
            [
              'Total Amount',
              `Rs ${(parseFloat(formData.s3?.total) || 0).toLocaleString('en-IN')}`,
            ],
          ].map(([key, value], index, arr) => (
            <div
              key={key}
              className={`flex items-start justify-between gap-4 py-2 text-sm ${
                index < arr.length - 1 ? 'border-b border-stone-200' : ''
              }`}
            >
              <span className="text-stone-500">{key}</span>
              <span className="text-right font-medium text-stone-900">{value}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`mt-6 inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium transition ${actionButtonStyles.primary}`}
          onClick={onNewLead}
        >
          + New Lead
        </button>
      </div>
    </div>
  </div>
);
