import { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  ChevronRight,
  Building2,
  Users,
  Calendar,
} from 'lucide-react';

const visitTypes = [
  { value: 'visitor', label: 'Visitor', icon: Users, color: 'bg-sky-50 border-sky-200 text-sky-700', active: 'bg-sky-500 border-sky-500 text-white' },
  { value: 'job', label: 'Job Enquiry', icon: Briefcase, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', active: 'bg-emerald-500 border-emerald-500 text-white' },
  { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'bg-amber-50 border-amber-200 text-amber-700', active: 'bg-amber-500 border-amber-500 text-white' },
];

export default function VisitorRegistrationForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    visitType: '',
    purpose: '',
    jobRole: '',
    experience: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectVisitType = (value) => {
    setForm(prev => ({ ...prev, visitType: value, jobRole: '', experience: '' }));
    if (errors.visitType) {
      setErrors(prev => ({ ...prev, visitType: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.visitType) newErrors.visitType = 'Please select a visit type';
    if (form.visitType === 'job' && !form.jobRole.trim()) newErrors.jobRole = 'Job role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setForm({ name: '', phone: '', email: '', visitType: '', purpose: '', jobRole: '', experience: '', address: '' });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return <SuccessScreen form={form} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        <SidePanel visitType={form.visitType} />

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-1">Welcome</p>
            <h1 className="text-3xl font-bold text-slate-800">Visitor Registration</h1>
            <p className="text-slate-500 mt-1">Fill in the details below to complete your check-in</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Section title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  error={errors.name}
                />
                <InputField
                  icon={Phone}
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  required
                  error={errors.phone}
                />
              </div>
              <InputField
                icon={Mail}
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
              />
            </Section>

            <Section title="Visit Details">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Visit Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {visitTypes.map(({ value, label, icon: Icon, color, active }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectVisitType(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm cursor-pointer
                        ${form.visitType === value ? active + ' shadow-md scale-[1.02]' : color + ' hover:scale-[1.01] hover:shadow-sm'}
                      `}
                    >
                      <Icon size={22} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {errors.visitType && <p className="mt-2 text-sm text-red-500">{errors.visitType}</p>}
              </div>

              <InputField
                icon={FileText}
                label="Purpose of Visit"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Brief purpose of your visit"
              />
            </Section>

            {form.visitType === 'job' && (
              <Section title="Job Enquiry Details" highlight>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    icon={Briefcase}
                    label="Job Role"
                    name="jobRole"
                    value={form.jobRole}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    required
                    error={errors.jobRole}
                  />
                  <InputField
                    icon={Clock}
                    label="Experience (years)"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 3 years"
                  />
                </div>
              </Section>
            )}

            <Section title="Address">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street, City, State, ZIP"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </Section>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              {submitting ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, highlight = false }) {
  return (
    <div className={`rounded-2xl p-5 space-y-4 ${highlight ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${highlight ? 'text-emerald-600' : 'text-slate-500'}`}>{title}</h3>
      {children}
    </div>
  );
}

function InputField({ icon: Icon, label, name, value, onChange, placeholder, type = 'text', required, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
            ${error ? 'border-red-300 bg-red-50 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'}
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">{error}</p>}
    </div>
  );
}

function SidePanel({ visitType }) {
  const config = {
    job: {
      bg: 'from-emerald-600 to-teal-700',
      icon: Briefcase,
      title: 'Job Enquiry',
      desc: 'Explore exciting career opportunities with our growing team.',
    },
    meeting: {
      bg: 'from-amber-500 to-orange-600',
      icon: Calendar,
      title: 'Meeting',
      desc: 'Scheduled meetings help us prepare to make your visit productive.',
    },
    visitor: {
      bg: 'from-sky-600 to-blue-700',
      icon: Users,
      title: 'Visitor',
      desc: 'Welcome! We are happy to have you here with us today.',
    },
    default: {
      bg: 'from-blue-700 to-slate-800',
      icon: Building2,
      title: 'Check In',
      desc: 'Register your visit quickly and securely with our digital check-in system.',
    },
  };

  const active = config[visitType] || config.default;
  const PanelIcon = active.icon;

  return (
    <div className={`hidden lg:flex flex-col justify-between w-80 bg-gradient-to-br ${active.bg} p-10 transition-all duration-500`}>
      <div>
        <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
          <Building2 size={24} className="text-white" />
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm transition-all duration-300">
            <PanelIcon size={28} className="text-white mb-3" />
            <h2 className="text-white font-bold text-xl mb-2">{active.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">{active.desc}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { icon: CheckCircle, text: 'Secure & private data' },
          { icon: CheckCircle, text: 'Instant confirmation' },
          { icon: CheckCircle, text: 'Fast check-in process' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
            <Icon size={16} className="text-white/60 shrink-0" />
            {text}
          </div>
        ))}
        <div className="pt-4 border-t border-white/20">
          <p className="text-white/50 text-xs">Powered by secure cloud infrastructure</p>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ form, onReset }) {
  const visitLabel = visitTypes.find(v => v.value === form.visitType)?.label || form.visitType;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">You're Checked In!</h2>
        <p className="text-slate-500 mb-6 text-sm">Your registration has been submitted successfully.</p>

        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          <Detail label="Name" value={form.name} />
          <Detail label="Phone" value={form.phone} />
          {form.email && <Detail label="Email" value={form.email} />}
          <Detail label="Visit Type" value={visitLabel} />
          {form.purpose && <Detail label="Purpose" value={form.purpose} />}
          {form.visitType === 'job' && form.jobRole && <Detail label="Job Role" value={form.jobRole} />}
        </div>

        <button
          onClick={onReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-200"
        >
          Register Another Visitor
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}