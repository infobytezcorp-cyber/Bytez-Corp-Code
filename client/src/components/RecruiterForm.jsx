import { useState } from "react";
import { Briefcase, FileText, GraduationCap, IdCard, Save, Upload, User, X } from "lucide-react";
import API from "../services/api";

const emptyForm = {
  name: "",
  age: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  whatsapp: "",
  email: "",
  maritalStatus: "",
  guardianType: "",
  guardianName: "",
  guardianContact: "",
  permanentAddress: "",
  knownLanguages: [],
  qualification: "",
  course: "",
  universityOrSchool: "",
  passOutYear: "",
  computerSkill: false,
  computerSkills: "",
  extraCurricular: "",
  fresherOrExperience: "",
  experienceLength: "",
  companyName: "",
  hrContact: "",
  previousRole: "",
  previousSalary: "",
  previousWorkingTime: "",
  aadharPhoto: "",
  recentPhoto: "",
  drivingLicense: "",
  jobLookingFor: "",
  expectedSalary: "",
  expectedWorkingTime: "",
  planningDurationType: "",
  shortTermOption: "",
  longTermOption: "",
  resume: "",
  jobTitle: "",
  location: "",
  experience: "",
  education: "",
  jobLocation: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#7B42BC] focus:ring-2 focus:ring-[#7B42BC]/15";
const labelClass = "block text-sm font-semibold text-gray-700";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function Section({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7B42BC]/10 text-[#6B35A9]">
          {icon}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputClass} />;
}

function SelectInput({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} className={inputClass}>
      {children}
    </select>
  );
}

function ChoiceGroup({ options, value, onChange, name }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            value === option.value
              ? "border-[#7B42BC] bg-[#7B42BC]/10 text-[#6B35A9]"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function FileUpload({ label, value, accept, onChange }) {
  return (
    <Field label={label}>
      <label className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 py-4 text-center transition hover:border-[#7B42BC] hover:bg-[#7B42BC]/5">
        <Upload size={20} className="text-[#6B35A9]" />
        <span className="mt-2 text-sm font-semibold text-gray-700">{value ? "File attached" : "Upload file"}</span>
        <span className="mt-1 text-xs text-gray-500">Click to choose</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) onChange(await fileToBase64(file));
          }}
        />
      </label>
    </Field>
  );
}

export default function RecruiterForm({ onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await API.post("/recruiters/submit", form);
      if (onSaved) await onSaved();
      resetForm();
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to save recruiter form", err);
      alert("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/45 px-4 py-8">
      <div className="relative w-[980px] max-w-[96vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recruiters Form</h2>
            <p className="mt-1 text-sm text-gray-500">Candidate details, documents, and job preferences.</p>
          </div>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close recruiter form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] space-y-5 overflow-auto p-6 pb-24">
          <Section icon={<User size={18} />} title="Personal Details">
            <Field label="Full Name" wide>
              <TextInput placeholder="Candidate name" value={form.name} onChange={(e) => setValue("name", e.target.value)} />
            </Field>
            <Field label="Email">
              <TextInput placeholder="Email address" value={form.email} onChange={(e) => setValue("email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <TextInput placeholder="Phone number" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} />
            </Field>
            <Field label="Age">
              <TextInput placeholder="Age" value={form.age} onChange={(e) => setValue("age", e.target.value)} />
            </Field>
            <Field label="Date of Birth">
              <TextInput type="date" value={form.dob} onChange={(e) => setValue("dob", e.target.value)} />
            </Field>
            <Field label="Gender">
              <SelectInput value={form.gender} onChange={(e) => setValue("gender", e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="WhatsApp">
              <TextInput placeholder="WhatsApp number" value={form.whatsapp} onChange={(e) => setValue("whatsapp", e.target.value)} />
            </Field>
            <Field label="Full Address" wide>
              <textarea
                placeholder="Full address"
                value={form.address}
                onChange={(e) => setValue("address", e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </Field>
            <Field label="Permanent Address">
              <TextInput placeholder="Permanent address" value={form.permanentAddress} onChange={(e) => setValue("permanentAddress", e.target.value)} />
            </Field>
            <Field label="Guardian Details">
              <div className="mt-2 grid gap-2">
                <input placeholder="Guardian type" value={form.guardianType} onChange={(e) => setValue("guardianType", e.target.value)} className={inputClass.replace("mt-2 ", "")} />
                <input placeholder="Guardian name" value={form.guardianName} onChange={(e) => setValue("guardianName", e.target.value)} className={inputClass.replace("mt-2 ", "")} />
                <input placeholder="Guardian contact" value={form.guardianContact} onChange={(e) => setValue("guardianContact", e.target.value)} className={inputClass.replace("mt-2 ", "")} />
              </div>
            </Field>
            <Field label="Known Languages" wide>
              <div className="mt-2 flex flex-wrap gap-2">
                {["English", "Malayalam", "Tamil", "Hindi", "Kannada"].map((lang) => (
                  <label
                    key={lang}
                    className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      form.knownLanguages.includes(lang)
                        ? "border-[#7B42BC] bg-[#7B42BC]/10 text-[#6B35A9]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.knownLanguages.includes(lang)}
                      onChange={(e) => {
                        const languages = new Set(form.knownLanguages);
                        if (e.target.checked) languages.add(lang);
                        else languages.delete(lang);
                        setValue("knownLanguages", Array.from(languages));
                      }}
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          <Section icon={<GraduationCap size={18} />} title="Education & Skills">
            <Field label="Qualification">
              <SelectInput value={form.qualification} onChange={(e) => setValue("qualification", e.target.value)}>
                <option value="">Select qualification</option>
                <option value="post_graduate">Post Graduate</option>
                <option value="under_graduate">Under Graduate</option>
                <option value="higher_secondary">Higher Secondary</option>
                <option value="high_school">High School</option>
              </SelectInput>
            </Field>
            <Field label="Course / Stream">
              <TextInput placeholder="Course completed" value={form.course} onChange={(e) => setValue("course", e.target.value)} />
            </Field>
            <Field label="University / School">
              <TextInput placeholder="University or school" value={form.universityOrSchool} onChange={(e) => setValue("universityOrSchool", e.target.value)} />
            </Field>
            <Field label="Pass Out Year">
              <TextInput placeholder="Pass out year" value={form.passOutYear} onChange={(e) => setValue("passOutYear", e.target.value)} />
            </Field>
            <Field label="Computer Skill">
              <ChoiceGroup
                name="computerSkill"
                value={form.computerSkill ? "yes" : "no"}
                onChange={(value) => setValue("computerSkill", value === "yes")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </Field>
            <Field label="Computer Skills Details">
              <TextInput placeholder="Computer skills" value={form.computerSkills} onChange={(e) => setValue("computerSkills", e.target.value)} />
            </Field>
            <Field label="Extra Curricular / Special Qualities" wide>
              <textarea
                placeholder="Extra curricular activities or special qualities"
                value={form.extraCurricular}
                onChange={(e) => setValue("extraCurricular", e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </Field>
          </Section>

          <Section icon={<Briefcase size={18} />} title="Experience">
            <Field label="Fresher or Experience">
              <ChoiceGroup
                name="fresherExp"
                value={form.fresherOrExperience}
                onChange={(value) => setValue("fresherOrExperience", value)}
                options={[
                  { value: "fresher", label: "Fresher" },
                  { value: "experience", label: "Experience" },
                ]}
              />
            </Field>
            <Field label="Length of Work Experience">
              <SelectInput value={form.experienceLength} onChange={(e) => setValue("experienceLength", e.target.value)}>
                <option value="">Select experience</option>
                <option value="0">0</option>
                <option value="1-3YEARS">1-3 years</option>
                <option value="3-5 YEARS">3-5 years</option>
                <option value="5 above YEARS">5+ years</option>
              </SelectInput>
            </Field>
            <Field label="Company Name">
              <TextInput placeholder="Company name" value={form.companyName} onChange={(e) => setValue("companyName", e.target.value)} />
            </Field>
            <Field label="HR Name and Contact">
              <TextInput placeholder="HR name and contact" value={form.hrContact} onChange={(e) => setValue("hrContact", e.target.value)} />
            </Field>
            <Field label="Previous Role / Domain">
              <TextInput placeholder="Previous role or domain" value={form.previousRole} onChange={(e) => setValue("previousRole", e.target.value)} />
            </Field>
            <Field label="Previous Salary">
              <TextInput placeholder="Previous salary details" value={form.previousSalary} onChange={(e) => setValue("previousSalary", e.target.value)} />
            </Field>
            <Field label="Previous Working Time">
              <TextInput placeholder="Previous office working time" value={form.previousWorkingTime} onChange={(e) => setValue("previousWorkingTime", e.target.value)} />
            </Field>
          </Section>

          <Section icon={<IdCard size={18} />} title="Documents">
            <FileUpload label="Aadhar Photo" value={form.aadharPhoto} accept="image/*" onChange={(value) => setValue("aadharPhoto", value)} />
            <FileUpload label="Recent Photo" value={form.recentPhoto} accept="image/*" onChange={(value) => setValue("recentPhoto", value)} />
            <FileUpload label="Driving License" value={form.drivingLicense} accept="image/*,application/pdf" onChange={(value) => setValue("drivingLicense", value)} />
            <FileUpload
              label="Resume"
              value={form.resume}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(value) => setValue("resume", value)}
            />
          </Section>

          <Section icon={<FileText size={18} />} title="Job Preference">
            <Field label="What Job Are You Looking For">
              <TextInput placeholder="Expected job role" value={form.jobLookingFor} onChange={(e) => setValue("jobLookingFor", e.target.value)} />
            </Field>
            <Field label="Expected Salary">
              <TextInput placeholder="Expected salary" value={form.expectedSalary} onChange={(e) => setValue("expectedSalary", e.target.value)} />
            </Field>
            <Field label="Expected Working Time">
              <TextInput placeholder="Expected working time" value={form.expectedWorkingTime} onChange={(e) => setValue("expectedWorkingTime", e.target.value)} />
            </Field>
            <Field label="Planning Duration Type">
              <SelectInput value={form.planningDurationType} onChange={(e) => setValue("planningDurationType", e.target.value)}>
                <option value="">Select duration type</option>
                <option value="short">Short Term</option>
                <option value="long">Long Term</option>
              </SelectInput>
            </Field>
            <Field label="Short Term Option">
              <SelectInput value={form.shortTermOption} onChange={(e) => setValue("shortTermOption", e.target.value)}>
                <option value="">Select short term option</option>
                <option value="1-3 MONTH">1-3 months</option>
                <option value="3-6 MONTH">3-6 months</option>
                <option value="6-12 MONTH">6-12 months</option>
              </SelectInput>
            </Field>
            <Field label="Long Term Option">
              <SelectInput value={form.longTermOption} onChange={(e) => setValue("longTermOption", e.target.value)}>
                <option value="">Select long term option</option>
                <option value="1-2 YEAR">1-2 years</option>
                <option value="2-3 YEAR">2-3 years</option>
                <option value="3-5 YEAR">3-5 years</option>
              </SelectInput>
            </Field>
          </Section>
        </form>

        <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-2 border-t border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7B42BC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6B35A9]"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
