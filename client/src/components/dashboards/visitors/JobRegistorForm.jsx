import { useState } from 'react';
import axios from 'axios';
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
  Hash,
  Droplets,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';


const visitTypes = [
  { value: 'visitor', label: 'Visitor', icon: Users, color: 'bg-sky-50 border-sky-200 text-sky-700', active: 'bg-sky-500 border-sky-500 text-white' },
  { value: 'job', label: 'Job Enquiry', icon: Briefcase, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', active: 'bg-emerald-500 border-emerald-500 text-white' },
];

const PURPOSES = [
  "Job",
  "Visiting",
  "Enquiry",
  "Other",
];

const JOB_ROLES = [
  "Web Developer",
  "UI/UX Designer",
  "HR",
  "Nurse",
  "Doctor",
  "Elder Care",
  "Home Care",
  "Legal Service",
  "Doctor Visit",
  "Staff",
  "Enquiry",
  "Donor",
  "Volunteers",
  "Professionals",
  "Business Partners",
  "Vendors",
  "Doctors (Professional)",
  "Other"
];



export default function VisitorRegistrationForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    aadhaarnumber: '',
    bloodGroup: '',
    visitType: '',
    purpose: '',
    purposeCustom: "",
    jobRole: '',
    jobRoleCustom: "",
    experience: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm(prev => ({ ...prev, [name]: value }));
  //   if (errors[name]) {
  //     setErrors(prev => ({ ...prev, [name]: '' }));
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // Aadhaar → only numbers allow
    if (name === "aadhaarnumber") {
      updatedValue = value.replace(/\D/g, ""); // remove non-digits
    }

    //Phone → only numbers
    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "");
    }

    setForm(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    // remove error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const selectVisitType = (value) => {
    setForm(prev => ({ ...prev, visitType: value, jobRole: '', experience: '' }));
    if (errors.visitType) {
      setErrors(prev => ({ ...prev, visitType: '' }));
    }
  };

  // const validate = () => {
  //   const newErrors = {};
  //   if (!form.name.trim()) newErrors.name = 'Name is required';
  //   if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
  //   else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
  //   if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
  //   if (!form.visitType) newErrors.visitType = 'Please select a visit type';
  //   if (form.visitType === 'job' && !form.jobRole.trim()) newErrors.jobRole = 'Job role is required';
  //   if (form.purpose === "Other" && !form.purposeCustom.trim()) {
  //     newErrors.purposeCustom = "Enter purpose";
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const validate = () => {
    const newErrors = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Phone
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter valid 10 digit number";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter valid email";
    }

    // Aadhaar
    if (!form.aadhaarnumber.trim()) {
      newErrors.aadhaarnumber = "Aadhaar is required";
    } else if (!/^\d{12}$/.test(form.aadhaarnumber)) {
      newErrors.aadhaarnumber = "Enter valid 12-digit Aadhaar";
    }

    // Blood Group
    if (!form.bloodGroup) {
      newErrors.bloodGroup = "Select blood group";
    }

    // Visit Type
    if (!form.visitType) {
      newErrors.visitType = "Select visit type";
    }

    // Job Role
    if (form.visitType === "job" && !form.jobRole.trim()) {
      newErrors.jobRole = "Job role is required";
    }

    // Purpose
    if (!form.purpose) {
      newErrors.purpose = "Purpose is required";
    }

    if (form.purpose === "Other" && !form.purposeCustom.trim()) {
      newErrors.purposeCustom = "Enter purpose";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const visitorId = localStorage.getItem("visitorId");

      console.log("visitorId:", visitorId);

      const payload = {
        visitorId,
        visitType: form.visitType,
        name: form.name,
        phone: form.phone,
        email: form.email,
        aadhaarnumber: form.aadhaarnumber,
        bloodGroup: form.bloodGroup,
        purpose:
          form.purpose === "Other"
            ? form.purposeCustom
            : form.purpose,
        visitPerson: form.visitPerson,
        jobRole:
          form.jobRole === "Other"
            ? form.jobRoleCustom
            : form.jobRole,
        experience: form.experience,
        address: form.address
      };

      console.log("API:", API);
      console.log("Payload:", payload);

      const res = await axios.post(
        `${API}/api/userdetails`,
        payload
      );

      console.log("Saved:", res.data);

      setSubmitted(true);

      // redirrect 
      navigate("/visitor");

    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Something went wrong ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: '',
      phone: '',
      email: '',
      aadhaarnumber: '',
      bloodGroup: '',
      visitType: '',
      purpose: '',
      jobRole: '',
      experience: '',
      address: '',
    });
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

            {/* Personal Information */}
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
                required
                error={errors.email}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  icon={Hash}
                  label="Aadhaar Number"
                  name="aadhaarnumber"
                  value={form.aadhaarnumber}
                  onChange={handleChange}
                  placeholder="e.g. 0x123XXXXX"
                  required
                  error={errors.aadhaarnumber}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Group</label>
                  <div className="relative">
                    <Droplets size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      name="bloodGroup"
                      value={form.bloodGroup}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select blood group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Visit Details */}
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

              {/* Purpose — only for Visitor type */}
              {form.visitType === 'visitor' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purpose <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                    <select
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl"
                    >
                      <option value="">Select purpose</option>
                      {PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}

                    </select>
                    {errors.purpose && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.purpose}
                      </p>
                    )}
                  </div>

                  {/* 🔥 SHOW INPUT IF OTHER */}
                  {form.purpose === "Other" && (
                    <InputField
                      icon={FileText}
                      label="Enter Purpose"
                      name="purposeCustom"
                      value={form.purposeCustom || ""}
                      onChange={handleChange}
                      placeholder="Enter purpose"
                    />
                  )}
                </div>  
              )}
            </Section>

            {/* Job Enquiry Details */}
            {form.visitType === 'job' && (
              <Section title="Job Enquiry Details" highlight>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* 🔥 JOB ROLE DROPDOWN */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Job Role <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Briefcase
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />

                      <select
                        name="jobRole"
                        value={form.jobRole}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="">Select Job Role</option>
                        {JOB_ROLES.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    {errors.jobRole && (
                      <p className="text-red-500 text-sm">{errors.jobRole}</p>
                    )}
                  </div>

                  {/* 🔥 EXPERIENCE */}
                  <InputField
                    icon={Clock}
                    label="Experience (years)"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 3 years"
                  />
                </div>

                {/* 🔥 SHOW INPUT IF OTHER */}
                {form.jobRole === "Other" && (
                  <InputField
                    icon={Briefcase}
                    label="Enter Job Role"
                    name="jobRoleCustom"
                    value={form.jobRoleCustom || ""}
                    onChange={handleChange}
                    placeholder="Enter your role"
                  />
                )}

                {/* PURPOSE */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purpose <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="">Select purpose</option>
                      {PURPOSES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {form.purpose === "Other" && (
                  <InputField
                    icon={FileText}
                    label="Enter Purpose"
                    name="purposeCustom"
                    value={form.purposeCustom || ""}
                    onChange={handleChange}
                    placeholder="Enter purpose"
                  />
                )}
              </Section>
            )}

            {/* Address */}
            <Section title="Address">
              <div>
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

        {/* 🔥 FIX HERE */}
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        )}

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

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
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
  const visitLabel =
    visitTypes.find(v => v.value === form.visitType)?.label || form.visitType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">

        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          You're Checked In!
        </h2>

        <p className="text-slate-500 mb-6 text-sm">
          Your registration has been submitted successfully.
        </p>

        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          <Detail label="Name" value={form.name} />
          <Detail label="Phone" value={form.phone} />

          {form.email && <Detail label="Email" value={form.email} />}

          <Detail label="Visit Type" value={visitLabel} />

          {/* 🔥 FIXED PURPOSE */}
          {form.purpose && (
            <Detail
              label="Purpose"
              value={
                form.purpose === "Other"
                  ? form.purposeCustom
                  : form.purpose
              }
            />
          )}

          {/* 🔥 OPTIONAL FIX FOR JOB ROLE ALSO */}
          {form.visitType === 'job' && form.jobRole && (
            <Detail
              label="Job Role"
              value={
                form.jobRole === "Other"
                  ? form.jobRoleCustom
                  : form.jobRole
              }
            />
          )}
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