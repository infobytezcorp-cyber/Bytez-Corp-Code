import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboards/Sidebar";
import API from "../services/api";
import AddEmployeeModal from "../components/hr/AddEmployeeModal";

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");

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

function FileButton({ value, label }) {
  if (!isDataUrl(value)) return <span className="text-xs text-gray-400">—</span>;
  return (
    <button
      onClick={() => openDataUrl(value)}
      className="inline-flex items-center rounded-lg border border-[#85B7EB] bg-[#E6F1FB] px-3 py-1.5 text-xs font-medium text-[#0C447C] hover:bg-[#B5D4F4] transition-colors"
    >
      {label}
    </button>
  );
}

function DetailsModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8">
      <div className="relative max-h-[90vh] w-[980px] max-w-[95vw] overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500">X</button>
        <h2 className="mb-4 text-xl font-semibold">HR Candidate Details</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(item).map(([key, value]) => {
            if (["_id", "__v", "internships", "resume"].includes(key)) return null;
            if (value === null || value === undefined || value === "") return null;

            return (
              <div key={key} className="min-w-0 rounded border p-3">
                <div className="mb-1 text-xs font-semibold text-slate-500">{key}</div>
                <div className="break-words text-sm">{String(value)}</div>
              </div>
            );
          })}

          <div className="rounded border p-3 md:col-span-2">
            <div className="mb-2 text-xs font-semibold text-slate-500">Resume</div>
            <FileButton value={item.resume} label="Open Resume" />
          </div>

          <div className="rounded border p-3 md:col-span-2">
            <div className="mb-2 text-xs font-semibold text-slate-500">Internships</div>
            {item.internships?.length ? (
              <div className="space-y-2">
                {item.internships.map((internship, index) => (
                  <div key={index} className="grid grid-cols-1 gap-2 rounded bg-slate-50 p-3 md:grid-cols-3">
                    <div><span className="font-semibold">Company:</span> {internship.companyName || '-'}</div>
                    <div><span className="font-semibold">Duration:</span> {internship.duration || '-'}</div>
                    <FileButton value={internship.certificate} label="Open Certificate" />
                  </div>
                ))}
              </div>
            ) : <span className="text-sm text-slate-400">No internships added</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterHrPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [appointing, setAppointing] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get('/recruiters/hr/list');
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Recruiter HR</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="rounded-md border bg-white px-3 py-1">Back</button>
            <button onClick={load} className="rounded-md border bg-white px-3 py-1">Refresh</button>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          {loading && <p>Loading...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-slate-500">No HR recruiter details yet.</p>}
          {items.length > 0 && (
            <div className="max-h-[72vh] overflow-auto">
 <table className="min-w-full">
  <thead>
    <tr className="bg-gray-50 border-b border-gray-100">
      {['Name','Contact number','Domain','Date','Resume','Actions'].map((head) => (
        <th key={head} className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">{head}</th>
      ))}
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100">
    {items.map((item, index) => (
      <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
        <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
        <td className="px-5 py-3 text-sm text-gray-700">{item.contactNumber}</td>
        <td className="px-5 py-3">
          <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#3C3489]">
            {item.domain}
          </span>
        </td>
        <td className="px-5 py-3 text-xs text-gray-500">{formatSubmittedDate(item.createdAt)}</td>
        <td className="px-5 py-3">
          <FileButton value={item.resume} label="Open ↗" />
        </td>
        <td className="px-5 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(item)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEEDFE] border border-[#AFA9EC] px-3 py-1.5 text-xs font-medium text-[#3C3489] hover:bg-[#CECBF6] transition-colors"
            >
              View details
            </button>
            <button
              onClick={() => setAppointing(item)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF3DE] border border-[#97C459] px-3 py-1.5 text-xs font-medium text-[#27500A] hover:bg-[#C0DD97] transition-colors"
            >
              Appointed ✓
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
            </div>
          )}
        </div>
      </div>

      {selected && <DetailsModal item={selected} onClose={() => setSelected(null)} />}
      {appointing && (
        <AddEmployeeModal
          initialHrCandidate={appointing}
          onClose={() => setAppointing(null)}
        />
      )}
    </div>
  );
}
