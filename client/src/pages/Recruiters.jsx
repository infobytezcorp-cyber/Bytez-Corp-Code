// import { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, CheckCircle2, Eye, RefreshCw, UserPlus, X, XCircle } from "lucide-react";
// import RecruiterForm from "../components/RecruiterForm";
// import Sidebar from "../components/dashboards/Sidebar";
// import API from "../services/api";

// const fileLabels = {
//   aadharPhoto: "Aadhar Photo",
//   recentPhoto: "Recent Photo",
//   drivingLicense: "Driving License",
//   resume: "Resume",
// };

// const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");
// const isImageDataUrl = (value) => isDataUrl(value) && value.startsWith("data:image");

// const formatSubmittedDate = (value) => {
//   if (!value) return "";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "";
//   return date.toLocaleDateString("en-IN");
// };

// const getJobTitle = (recruiter) =>
//   recruiter.jobTitle ||
//   recruiter.previousRole ||
//   recruiter.jobLookingFor ||
//   recruiter.raw?.jobTitle ||
//   recruiter.raw?.previousRole ||
//   "-";

// const getStatusClass = (status) => {
//   const value = String(status || "pending").toLowerCase();
//   if (value === "selected") return "bg-green-50 text-green-700 border border-green-200";
//   if (value === "rejected") return "bg-red-50 text-red-700 border border-red-200";
//   return "bg-amber-50 text-amber-700 border border-amber-200";
// };

// const openDataUrl = (dataUrl) => {
//   const [meta, base64 = ""] = dataUrl.split(",");
//   const mime = meta.match(/^data:(.*?);base64$/)?.[1] || "application/octet-stream";
//   const binary = atob(base64);
//   const bytes = new Uint8Array(binary.length);

//   for (let i = 0; i < binary.length; i += 1) {
//     bytes[i] = binary.charCodeAt(i);
//   }

//   const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
//   window.open(blobUrl, "_blank", "noopener,noreferrer");
//   setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
// };

// function DetailValue({ label, value }) {
//   if (isDataUrl(value)) {
//     if (isImageDataUrl(value)) {
//       return (
//         <button
//           type="button"
//           onClick={() => openDataUrl(value)}
//           className="group w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left"
//           title="Click to open image"
//         >
//           <img
//             src={value}
//             alt={label}
//             className="h-44 w-full object-contain p-2 transition-transform group-hover:scale-[1.02]"
//           />
//           <div className="border-t border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600">
//             Open image
//           </div>
//         </button>
//       );
//     }

//     return (
//       <button
//         type="button"
//         onClick={() => openDataUrl(value)}
//         className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
//       >
//         Open document
//       </button>
//     );
//   }

//   if (Array.isArray(value)) {
//     return <div className="text-sm break-words">{value.join(", ")}</div>;
//   }

//   if (typeof value === "object") {
//     return (
//       <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs">
//         {JSON.stringify(value, null, 2)}
//       </pre>
//     );
//   }

//   return <div className="text-sm break-words">{String(value)}</div>;
// }

// export default function Recruiters() {
//   const [recruiters, setRecruiters] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const navigate = useNavigate();

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await API.get('/recruiters/list');
//       setRecruiters((res.data && res.data.data) || []);
//     } catch (e) {
//       console.error('Failed to load recruiters', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadSelectedCandidates = async () => {
//     setLoading(true);
//     try {
//       const res = await API.get('/recruiters/list?status=selected');
//       setRecruiters((res.data && res.data.data) || []);
//     } catch (e) {
//       console.error('Failed to load selected candidates', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadRejectedCandidates = async () => {
//     setLoading(true);
//     try {
//       const res = await API.get('/recruiters/list?status=rejected');
//       setRecruiters((res.data && res.data.data) || []);
//     } catch (e) {
//       console.error('Failed to load rejected candidates', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateCandidateStatus = async (id, status) => {
//     try {
//       await API.patch(`/recruiters/update-status/${id}`, { status });
//       if (status === 'selected') {
//         await loadSelectedCandidates();
//       } else {
//         await loadRejectedCandidates();
//       }
//     } catch (e) {
//       console.error(`Failed to update candidate status to ${status}`, e);
//       alert(`Failed to update candidate status to ${status}`);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   // showForm toggles rendering of RecruiterForm component

//   return (
//     <div className="flex h-screen bg-[#F8F9FB]">
//       <Sidebar />
//       <div className="flex-1 overflow-auto">
//         <div className="p-6">
//           <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Recruiters</h1>
//               <p className="mt-1 text-sm text-gray-500">Review candidate submissions and update selection status.</p>
//             </div>
//             <div className="flex flex-wrap items-center gap-2">
//               <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
//                 <ArrowLeft size={16} />
//                 Back
//               </button>
//               <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#7B42BC] bg-[#7B42BC] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6B35A9]">
//                 <UserPlus size={16} />
//                 Recruiters Form
//               </button>
//               <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
//                 <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//                 Refresh
//               </button>
//             </div>
//           </div>

// <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//   <div>
//     <h2 className="text-[15px] font-medium text-gray-900">Recruiter applications</h2>
//     <p className="text-xs text-gray-500 mt-0.5">{recruiters.length} candidates found</p>
//   </div>
// </div>

//             {loading ? (
//               <div className="py-12 text-center">
//                 <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#7B42BC]"></div>
//                 <p className="mt-4 text-gray-600">Loading recruiters...</p>
//               </div>
//             ) : recruiters.length === 0 ? (
//               <div className="py-12 text-center">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
//                   <UserPlus size={22} />
//                 </div>
//                 <p className="mt-3 text-lg font-medium text-gray-700">No recruiters found</p>
//                 <p className="mt-1 text-sm text-gray-500">New applications will appear here.</p>
//               </div>
//             ) : (
// <div className="overflow-x-auto">
//   <table className="w-full">
//     <thead>
//       <tr className="bg-gray-50 border-b border-gray-100">
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Name</th>
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Contact</th>
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Job title</th>
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Status</th>
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Submitted</th>
//         <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Actions</th>
//       </tr>
//     </thead>
//     <tbody className="divide-y divide-gray-100">
//       {recruiters.map((r, i) => (
//         <tr key={r._id || i} className="hover:bg-gray-50 transition-colors">
//           <td className="px-5 py-3">
//             <p className="text-sm font-medium text-gray-900">{r.name || "-"}</p>
//             <p className="text-xs text-gray-500 mt-0.5">{r.qualification || r.education || "-"}</p>
//           </td>
//           <td className="px-5 py-3">
//             <p className="text-sm text-gray-900">{r.phone || "-"}</p>
//             <p className="text-xs text-gray-500 mt-0.5">{r.email || "-"}</p>
//           </td>
//           <td className="px-5 py-3">
//             <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#3C3489]">
//               {getJobTitle(r)}
//             </span>
//           </td>
//           <td className="px-5 py-3">
//             <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(r.status)}`}>
//               {r.status || "pending"}
//             </span>
//           </td>
//           <td className="px-5 py-3 text-xs text-gray-500">{formatSubmittedDate(r.createdAt) || "-"}</td>
//           <td className="px-5 py-3">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => { setSelected(r); setShowDetails(true); }}
//                 className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEEDFE] border border-[#AFA9EC] px-3 py-1.5 text-xs font-medium text-[#3C3489] hover:bg-[#CECBF6] transition-colors"
//               >
//                 <Eye size={13} /> View
//               </button>
//               <button
//                 onClick={async () => { try { await API.post('/recruiters/mark', { id: r._id, status: 'selected' }); await load(); } catch(e) { console.error(e); alert('Failed to mark selected'); }}}
//                 className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF3DE] border border-[#97C459] px-3 py-1.5 text-xs font-medium text-[#27500A] hover:bg-[#C0DD97] transition-colors"
//               >
//                 <CheckCircle2 size={13} /> Select
//               </button>
//               <button
//                 onClick={async () => { try { await API.post('/recruiters/mark', { id: r._id, status: 'rejected' }); await load(); } catch(e) { console.error(e); alert('Failed to mark rejected'); }}}
//                 className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCEBEB] border border-[#F09595] px-3 py-1.5 text-xs font-medium text-[#791F1F] hover:bg-[#F7C1C1] transition-colors"
//               >
//                 <XCircle size={13} /> Reject
//               </button>
//             </div>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//         {showForm && (
//           <RecruiterForm onClose={() => setShowForm(false)} onSaved={load} />
//         )}

//         {showDetails && selected && (
//           <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/45 px-4 py-8">
//             <div className="relative max-h-[90vh] w-[960px] max-w-[95vw] overflow-auto rounded-xl bg-white shadow-2xl">
//               <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-900">Recruiter Details</h2>
//                   <p className="mt-1 text-sm text-gray-500">{selected.name || "Candidate"} application profile</p>
//                 </div>
//                 <button onClick={() => { setShowDetails(false); setSelected(null); }} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close details">
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-2">
//                 {Object.entries(selected).map(([key, val]) => {
//                   if (key === '_id' || key === '__v') return null;
//                   if (key === 'raw') return null;
//                   if (val === null || val === undefined || val === '') return null;

//                   return (
//                     <div key={key} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
//                       <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{key}</div>
//                       <DetailValue label={fileLabels[key] || key} value={val} />
//                     </div>
//                   );
//                 })}
//                 {selected.raw && Object.entries(selected.raw).map(([k, v]) => {
//                   if (isDataUrl(v)) return null;
//                   if (v === null || v === undefined || v === '') return null;
//                   if (selected[k] !== undefined) return null;

//                   return (
//                     <div key={'raw-' + k} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
//                       <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{k}</div>
//                       <DetailValue label={k} value={v} />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, RefreshCw, UserPlus, X, XCircle } from "lucide-react";
import RecruiterForm from "../components/RecruiterForm";
import Sidebar from "../components/dashboards/Sidebar";
import API from "../services/api";

const fileLabels = {
  aadharPhoto: "Aadhar Photo",
  recentPhoto: "Recent Photo",
  drivingLicense: "Driving License",
  resume: "Resume",
};

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");
const isImageDataUrl = (value) => isDataUrl(value) && value.startsWith("data:image");

const formatSubmittedDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
};

const getJobTitle = (recruiter) =>
  recruiter.jobTitle ||
  recruiter.previousRole ||
  recruiter.jobLookingFor ||
  recruiter.raw?.jobTitle ||
  recruiter.raw?.previousRole ||
  "-";

const getStatusClass = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (value === "selected") return "bg-green-50 text-green-700 border border-green-200";
  if (value === "rejected") return "bg-red-50 text-red-700 border border-red-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
};

const openDataUrl = (dataUrl) => {
  const [meta, base64 = ""] = dataUrl.split(",");
  const mime = meta.match(/^data:(.*?);base64$/)?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
};

function DetailValue({ label, value }) {
  // Security: Redact Aadhaar digits if they appear as text
  if (label?.toLowerCase().includes("aadhar") && typeof value === "string" && !isDataUrl(value)) {
    return <div className="text-sm font-mono text-gray-600">[Aadhaar Redacted]</div>;
  }

  if (isDataUrl(value)) {
    if (isImageDataUrl(value)) {
      return (
        <button
          type="button"
          onClick={() => openDataUrl(value)}
          className="group w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left"
          title="Click to open image"
        >
          <img
            src={value}
            alt={label}
            className="h-44 w-full object-contain p-2 transition-transform group-hover:scale-[1.02]"
          />
          <div className="border-t border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600">
            Open image
          </div>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openDataUrl(value)}
        className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
      >
        Open document
      </button>
    );
  }

  if (Array.isArray(value)) {
    return <div className="text-sm break-words">{value.join(", ")}</div>;
  }

  if (typeof value === "object") {
    return (
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <div className="text-sm break-words">{String(value)}</div>;
}

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get('/recruiters/list');
      setRecruiters((res.data && res.data.data) || []);
    } catch (e) {
      console.error('Failed to load recruiters', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Recruiters</h1>
              <p className="mt-1 text-sm text-gray-500">Review candidate submissions and update selection status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#7B42BC] bg-[#7B42BC] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6B35A9]">
                <UserPlus size={16} />
                Recruiters Form
              </button>
              <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl">
            <div>
              <h2 className="text-[15px] font-medium text-gray-900">Recruiter applications</h2>
              <p className="text-xs text-gray-500 mt-0.5">{recruiters.length} candidates found</p>
            </div>
          </div>

          {/* Conditional Content Rendering */}
          {loading ? (
            <div className="py-12 text-center bg-white border-x border-b border-gray-100 rounded-b-xl">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#7B42BC]"></div>
              <p className="mt-4 text-gray-600">Loading recruiters...</p>
            </div>
          ) : recruiters.length === 0 ? (
            <div className="py-12 text-center bg-white border-x border-b border-gray-100 rounded-b-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <UserPlus size={22} />
              </div>
              <p className="mt-3 text-lg font-medium text-gray-700">No recruiters found</p>
              <p className="mt-1 text-sm text-gray-500">New applications will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border-x border-b border-gray-100 rounded-b-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Contact</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Job title</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Submitted</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recruiters.map((r, i) => (
                    <tr key={r._id || i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{r.name || "-"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.qualification || r.education || "-"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-900">{r.phone || "-"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.email || "-"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#3C3489]">
                          {getJobTitle(r)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(r.status)}`}>
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{formatSubmittedDate(r.createdAt) || "-"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelected(r); setShowDetails(true); }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEEDFE] border border-[#AFA9EC] px-3 py-1.5 text-xs font-medium text-[#3C3489] hover:bg-[#CECBF6] transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={async () => { try { await API.post('/recruiters/mark', { id: r._id, status: 'selected' }); await load(); } catch(e) { console.error(e); alert('Failed to mark selected'); }}}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF3DE] border border-[#97C459] px-3 py-1.5 text-xs font-medium text-[#27500A] hover:bg-[#C0DD97] transition-colors"
                          >
                            <CheckCircle2 size={13} /> Select
                          </button>
                          <button
                            onClick={async () => { try { await API.post('/recruiters/mark', { id: r._id, status: 'rejected' }); await load(); } catch(e) { console.error(e); alert('Failed to mark rejected'); }}}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCEBEB] border border-[#F09595] px-3 py-1.5 text-xs font-medium text-[#791F1F] hover:bg-[#F7C1C1] transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <RecruiterForm onClose={() => setShowForm(false)} onSaved={load} />
          )}

          {/* Details Modal */}
          {showDetails && selected && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/45 px-4 py-8">
              <div className="relative max-h-[90vh] w-[960px] max-w-[95vw] overflow-auto rounded-xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Recruiter Details</h2>
                    <p className="mt-1 text-sm text-gray-500">{selected.name || "Candidate"} application profile</p>
                  </div>
                  <button onClick={() => { setShowDetails(false); setSelected(null); }} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close details">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-2">
                  {Object.entries(selected).map(([key, val]) => {
                    if (key === '_id' || key === '__v' || key === 'raw') return null;
                    if (val === null || val === undefined || val === '') return null;

                    return (
                      <div key={key} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{key}</div>
                        <DetailValue label={fileLabels[key] || key} value={val} />
                      </div>
                    );
                  })}
                  {selected.raw && Object.entries(selected.raw).map(([k, v]) => {
                    if (isDataUrl(v) || v === null || v === undefined || v === '' || selected[k] !== undefined) return null;

                    return (
                      <div key={'raw-' + k} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{k}</div>
                        <DetailValue label={k} value={v} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}