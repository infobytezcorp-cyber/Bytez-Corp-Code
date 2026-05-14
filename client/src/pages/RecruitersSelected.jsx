import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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

function CandidateDetailsModal({ candidate, onClose }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8">
      <div className="relative max-h-[90vh] w-[960px] max-w-[95vw] overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500">X</button>
        <h2 className="mb-4 text-xl font-semibold">Recruiter Details</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(candidate).map(([key, val]) => {
            if (["_id", "__v", "raw"].includes(key)) return null;
            if (val === null || val === undefined || val === "") return null;

            return (
              <div key={key} className="min-w-0 rounded border p-3">
                <div className="mb-1 text-xs font-medium text-slate-500">{key}</div>
                <DetailValue label={key} value={val} />
              </div>
            );
          })}
          {candidate.raw && Object.entries(candidate.raw).map(([key, val]) => {
            if (isDataUrl(val)) return null;
            if (val === null || val === undefined || val === "") return null;
            if (candidate[key] !== undefined) return null;

            return (
              <div key={`raw-${key}`} className="min-w-0 rounded border p-3">
                <div className="mb-1 text-xs font-medium text-slate-500">{key}</div>
                <DetailValue label={key} value={val} />
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

  const submit = async (e) => {
    e.preventDefault();
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
        <p className="mb-5 text-sm text-slate-500">Selected recruiter details pre-filled. Fill remaining HR verification fields.</p>

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
              <input className={inputClass} value={form[key]} onChange={(e) => setField(key, e.target.value)} />
            </div>
          ))}

          <div className="md:col-span-2 rounded-lg border bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Internships</h3>
              <button type="button" onClick={addInternship} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Add Other Internship</button>
            </div>

            <div className="space-y-4">
              {form.internships.map((internship, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-3 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Internship Company Name</label>
                    <input className={inputClass} value={internship.companyName} onChange={(e) => setInternship(index, 'companyName', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Internship Duration</label>
                    <input className={inputClass} value={internship.duration} onChange={(e) => setInternship(index, 'duration', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Upload Internship Certificate</label>
                    <input type="file" accept="image/*,application/pdf" onChange={async (e) => {
                      const file = e.target.files?.[0];
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
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={async (e) => {
              const file = e.target.files?.[0];
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

export default function RecruitersSelected(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [hrCandidate, setHrCandidate] = useState(null);
  const navigate = useNavigate();

  const load = async ()=>{
    setLoading(true);
    try{
      const res = await API.get('/recruiters/list', { params: { status: 'selected' } });
      setItems((res.data && res.data.data) || []);
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Selected Candidates</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate(-1)} className="rounded-md border bg-white px-3 py-1">Back</button>
            <button onClick={load} className="rounded-md border bg-white px-3 py-1">Refresh</button>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          {loading && <p>Loading...</p>}
          {items.length === 0 && !loading && <p className="text-sm text-slate-500">No selected candidates.</p>}
          {items.length > 0 && (
            <div className="max-h-[70vh] overflow-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Name</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Email</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Phone</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Job Title</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Submitted Date</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r,i)=> (
                    <tr key={r._id || i} className={i%2===0?'bg-white':'bg-slate-50'}>
                      <td className="border-b px-3 py-2 text-sm align-top">{r.name}</td>
                      <td className="border-b px-3 py-2 text-sm align-top">{r.email}</td>
                      <td className="border-b px-3 py-2 text-sm align-top">{r.phone}</td>
                      <td className="border-b px-3 py-2 text-sm align-top">{r.jobTitle || r.previousRole || r.jobLookingFor || ''}</td>
                      <td className="border-b px-3 py-2 text-sm align-top">{formatSubmittedDate(r.createdAt)}</td>
                      <td className="flex gap-2 border-b px-3 py-2 text-sm align-top">
                        <button onClick={() => setDetails(r)} className="rounded bg-[#7B42BC] px-3 py-1 text-white">View Details</button>
                        <button onClick={() => setHrCandidate(r)} className="rounded bg-green-600 px-3 py-1 text-white">Next</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {details && <CandidateDetailsModal candidate={details} onClose={() => setDetails(null)} />}
      {hrCandidate && <HrFormModal candidate={hrCandidate} onClose={() => setHrCandidate(null)} onSaved={load} />}
    </div>
  );
}
