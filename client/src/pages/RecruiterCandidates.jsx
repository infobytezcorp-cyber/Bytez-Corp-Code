import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboards/Sidebar";
import API from "../services/api";

const emptyInternship = { companyName: "", duration: "", certificate: "" };

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");
const isImageDataUrl = (value) => isDataUrl(value) && value.startsWith("data:image");

const formatSubmittedDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
};

const openDataUrl = (dataUrl) => {
  const [meta, base64 = ""] = dataUrl.split(",");
  const mime = meta.match(/^data:(.*?);base64$/)?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
};

function DetailValue({ label, value }) {
  if (isDataUrl(value)) {
    if (isImageDataUrl(value)) {
      return (
        <button type="button" onClick={() => openDataUrl(value)} className="w-full overflow-hidden rounded-lg border bg-slate-50 text-left">
          <img src={value} alt={label} className="h-40 w-full object-contain p-2" />
          <div className="border-t px-3 py-2 text-xs font-semibold text-blue-600">Open image</div>
        </button>
      );
    }

    return <button type="button" onClick={() => openDataUrl(value)} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">Open document</button>;
  }

  if (Array.isArray(value)) return <div className="text-sm break-words">{value.join(", ")}</div>;
  if (typeof value === "object") return <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs">{JSON.stringify(value, null, 2)}</pre>;
  return <div className="text-sm break-words">{String(value)}</div>;
}

function DetailsModal({ candidate, onClose }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8">
      <div className="relative max-h-[90vh] w-[960px] max-w-[95vw] overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500">X</button>
        <h2 className="mb-4 text-xl font-semibold">Candidate Details</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(candidate).map(([key, value]) => {
            if (["_id", "__v", "raw"].includes(key)) return null;
            if (value === null || value === undefined || value === "") return null;

            return (
              <div key={key} className="min-w-0 rounded border p-3">
                <div className="mb-1 text-xs font-medium text-slate-500">{key}</div>
                <DetailValue label={key} value={value} />
              </div>
            );
          })}
          {candidate.raw && Object.entries(candidate.raw).map(([key, value]) => {
            if (isDataUrl(value)) return null;
            if (value === null || value === undefined || value === "") return null;
            if (candidate[key] !== undefined) return null;

            return (
              <div key={`raw-${key}`} className="min-w-0 rounded border p-3">
                <div className="mb-1 text-xs font-medium text-slate-500">{key}</div>
                <DetailValue label={key} value={value} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HrFormModal({ candidate, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    recruiterFormId: candidate?._id || "",
    name: candidate?.name || "",
    contactNumber: candidate?.phone || "",
    whatsappNumber: candidate?.whatsapp || "",
    guardianName: candidate?.guardianName || "",
    guardianContactNumber: candidate?.guardianContact || "",
    aadhaarNumber: "",
    location: candidate?.location || candidate?.address || "",
    tenthPercentage: "",
    twelfthPercentage: "",
    qualification: candidate?.qualification || "",
    collegeName: candidate?.universityOrSchool || "",
    cgpa: "",
    domain: candidate?.previousRole || candidate?.jobLookingFor || "",
    skills: candidate?.computerSkills || "",
    experience: candidate?.experienceLength || candidate?.fresherOrExperience || "",
    previousCompanyName: candidate?.companyName || "",
    previousCompanyHrName: "",
    previousCompanyHrContactNumber: candidate?.hrContact || "",
    internships: [{ ...emptyInternship }],
    resume: candidate?.resume || "",
  }));

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setInternship = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      internships: prev.internships.map((item, i) => i === index ? { ...item, [key]: value } : item),
    }));
  };

  const addInternship = () => setForm((prev) => ({ ...prev, internships: [...prev.internships, { ...emptyInternship }] }));
  const removeInternship = (index) => setForm((prev) => ({ ...prev, internships: prev.internships.filter((_, i) => i !== index) }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await API.post('/recruiters/hr/submit', form);
      alert('HR details submitted');
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit HR details');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500";
  const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-6">
      <form onSubmit={submit} className="relative max-h-[92vh] w-[980px] max-w-[96vw] overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 text-slate-500">X</button>
        <h2 className="mb-1 text-xl font-semibold">HR Details Form</h2>
        <p className="mb-5 text-sm text-slate-500">Selected candidate details pre-filled. Fill remaining HR verification fields.</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["name", "Name"],
            ["contactNumber", "Contact Number"],
            ["whatsappNumber", "WhatsApp Number"],
            ["guardianName", "Guardian Name"],
            ["guardianContactNumber", "Guardian Contact Number"],
            ["aadhaarNumber", "Aadhaar Number"],
            ["location", "Location"],
            ["tenthPercentage", "10th Percentage"],
            ["twelfthPercentage", "12th Percentage"],
            ["qualification", "Qualification"],
            ["collegeName", "College Name"],
            ["cgpa", "CGPA"],
            ["domain", "Domain"],
            ["skills", "Skills"],
            ["experience", "Experience"],
            ["previousCompanyName", "Previous Company Name"],
            ["previousCompanyHrName", "Previous Company HR Name"],
            ["previousCompanyHrContactNumber", "Previous Company HR Contact Number"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input className={inputClass} value={form[key]} onChange={(event) => setField(key, event.target.value)} />
            </div>
          ))}

          <div className="rounded-lg border bg-slate-50 p-4 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Internships</h3>
              <button type="button" onClick={addInternship} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Add Other Internship</button>
            </div>

            <div className="space-y-4">
              {form.internships.map((internship, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-3 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Internship Company Name</label>
                    <input className={inputClass} value={internship.companyName} onChange={(event) => setInternship(index, 'companyName', event.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Internship Duration</label>
                    <input className={inputClass} value={internship.duration} onChange={(event) => setInternship(index, 'duration', event.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Upload Internship Certificate</label>
                    <input type="file" accept="image/*,application/pdf" onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (file) setInternship(index, 'certificate', await fileToBase64(file));
                    }} />
                    {internship.certificate && <button type="button" onClick={() => openDataUrl(internship.certificate)} className="mt-2 text-xs font-semibold text-blue-600">Open uploaded certificate</button>}
                  </div>
                  {form.internships.length > 1 && (
                    <button type="button" onClick={() => removeInternship(index)} className="text-left text-xs font-semibold text-red-600 md:col-span-3">Remove internship</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Resume</label>
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setField('resume', await fileToBase64(file));
            }} />
            {form.resume && <button type="button" onClick={() => openDataUrl(form.resume)} className="ml-3 text-xs font-semibold text-blue-600">Open resume</button>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button disabled={saving} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
}

export default function RecruiterCandidates() {
  const [activeTab, setActiveTab] = useState("selected");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hrCandidate, setHrCandidate] = useState(null);
  const navigate = useNavigate();

  const load = async (status = activeTab) => {
    setLoading(true);
    try {
      const res = await API.get('/recruiters/list', { params: { status } });
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const title = activeTab === "selected" ? "Selected Candidates" : "Rejected Candidates";

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Candidates</h1>
            <p className="mt-1 text-sm text-slate-500">Selected and rejected candidate details in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="rounded-md border bg-white px-3 py-1">Back</button>
            <button onClick={() => load(activeTab)} className="rounded-md border bg-white px-3 py-1">Refresh</button>
          </div>
        </div>

<div className="mb-4 flex gap-2">
  <button
    onClick={() => setActiveTab("selected")}
    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === "selected"
        ? "bg-[#EAF3DE] text-[#27500A] border border-[#97C459]"
        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`}
  >
    ✓ Selected candidates
  </button>
  <button
    onClick={() => setActiveTab("rejected")}
    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === "rejected"
        ? "bg-[#FCEBEB] text-[#791F1F] border border-[#F09595]"
        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`}
  >
    ✕ Rejected candidates
  </button>
</div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>

          {loading && <p>Loading...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-slate-500">No {title.toLowerCase()} found.</p>}
          {!loading && items.length > 0 && (
 <table className="min-w-full">
  <thead>
    <tr className="bg-gray-50 border-b border-gray-100">
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Name</th>
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Email</th>
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Phone</th>
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Job title</th>
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Submitted</th>
      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100">
    {items.map((candidate, index) => (
      <tr key={candidate._id || index} className="hover:bg-gray-50 transition-colors">
        <td className="px-5 py-3 text-sm font-medium text-gray-900">{candidate.name}</td>
        <td className="px-5 py-3 text-xs text-gray-500">{candidate.email}</td>
        <td className="px-5 py-3 text-sm text-gray-700">{candidate.phone}</td>
        <td className="px-5 py-3">
          <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#3C3489]">
            {candidate.jobTitle || candidate.previousRole || candidate.jobLookingFor || "—"}
          </span>
        </td>
        <td className="px-5 py-3 text-xs text-gray-500">{formatSubmittedDate(candidate.createdAt)}</td>
        <td className="px-5 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCandidate(candidate)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEEDFE] border border-[#AFA9EC] px-3 py-1.5 text-xs font-medium text-[#3C3489] hover:bg-[#CECBF6] transition-colors"
            >
              View details
            </button>
            {activeTab === "selected" && (
              <button
                onClick={() => setHrCandidate(candidate)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF3DE] border border-[#97C459] px-3 py-1.5 text-xs font-medium text-[#27500A] hover:bg-[#C0DD97] transition-colors"
              >
                Move next →
              </button>
            )}
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>
      </div>

      {selectedCandidate && <DetailsModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
      {hrCandidate && <HrFormModal candidate={hrCandidate} onClose={() => setHrCandidate(null)} onSaved={() => load(activeTab)} />}
    </div>
  );
}
