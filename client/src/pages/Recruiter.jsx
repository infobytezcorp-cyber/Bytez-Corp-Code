import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboards/Sidebar";
import * as XLSX from "xlsx";
import API from "../services/api";

const SOURCES = ["indeed", "linkedin", "naukri", "monster", "website"];

const FIXED_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone Number" },
  { key: "jobTitle", label: "Job Title" },
  { key: "date", label: "Submitted Date" },
  { key: "view", label: "" },
];

const normalizeField = (header) => {
  const h = String(header || "").toLowerCase();
  if (/(job location|work location)/.test(h)) return "jobLocation";
  if (/(location|city|place)/.test(h)) return "location";
  if (/(name|full name|candidate)/.test(h)) return "name";
  if (/(email|e-?mail)/.test(h)) return "email";
  if (/(phone|mobile|contact)/.test(h)) return "phone";
  if (/(job title|position|designation|role)/.test(h)) return "jobTitle";
  if (/(date|applied|created)/.test(h)) return "date";
  if (/(experience|exp|years)/.test(h)) return "experience";
  if (/(education|qualification|degree)/.test(h)) return "education";
  return null;
};

const mapRowToModel = (row) => {
  const out = {
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    date: "",
    location: "",
    experience: "",
    education: "",
    jobLocation: "",
    raw: row,
  };

Object.keys(row || {}).forEach((k) => {
    const normalized = normalizeField(k);
    if (normalized) {
      const value = (normalized === "phone") ? sanitizePhone(row[k]) : sanitize(row[k]);
      
      // ஏற்கனவே value இருந்தா, புதுசா வர்றது காலியா இருந்தா overwrite பண்ணாதீங்க
      if (!out[normalized] || (out[normalized] && value)) {
        out[normalized] = value;
      }
    }
  });

  // Fallback: try to pull common keys directly
  if (!out.name) out.name = row.name || row.Name || row["Full Name"] || "";
  if (!out.email) out.email = row.email || row.Email || "";
  if (!out.phone) out.phone = sanitizePhone(row.phone || row.Phone || row.Mobile || "");
    // Heuristic: sometimes CSVs have mis-aligned columns where location ends up in `name`.
    // If the mapped `name` looks like a location (contains comma or known place words), move it to `location`
    // and try to derive a plausible name from the email as a fallback.
    const looksLikeLocation = (s) => {
      if (!s) return false;
      const ss = String(s).trim();
      if (ss.includes(",")) return true;
      const placeWords = /(india|tamil|karnataka|bengaluru|coimbatore|chennai|bihar|patna|tiruppur|pune|mumbai|delhi)/i;
      if (placeWords.test(ss)) return true;
      return false;
    };

    const deriveNameFromEmail = (email) => {
      if (!email) return "";
      const local = String(email).split("@")[0] || "";
      const parts = local.split(/[^a-zA-Z]+/).filter(Boolean);
      if (parts.length === 0) return "";
      // take first two parts and title-case them
      return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    };

    if (out.name && looksLikeLocation(out.name)) {
      // move suspected location into location if empty
      if (!out.location) out.location = out.name;
      const fallback = deriveNameFromEmail(out.email || (out.raw && out.raw.email));
      out.name = fallback || "";
    }

    // Normalize/derive education from raw if missing
    if (!out.education) {
      const eduKey = Object.keys(row || {}).find((k) => /education|qualification|degree|qual|course/i.test(k));
      if (eduKey) out.education = sanitize(row[eduKey]);
    }

    // Normalize/derive date from raw if missing; convert to ISO string when possible
    if (!out.date) {
      const dateKey = Object.keys(row || {}).find((k) => /date|applied|created|joined|posted/i.test(k));
      const rawDate = dateKey ? (row[dateKey] || row[dateKey.toLowerCase()]) : null;
      if (rawDate) {
        const parsed = Date.parse(String(rawDate));
        if (!isNaN(parsed)) out.date = new Date(parsed).toISOString();
        else out.date = String(rawDate).trim();
      }
    } else {
      // if out.date exists as string, try to parse and convert to ISO
      try {
        const p = Date.parse(String(out.date));
        if (!isNaN(p)) out.date = new Date(p).toISOString();
      } catch (e) {}
    }

  return out;
};

// Parse sheet robustly: detect header row among first 3 rows, then map subsequent rows to objects
const parseSheetToJson = (sheet) => {
  const arrays = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!arrays || arrays.length === 0) return [];

  const firstN = Math.min(3, arrays.length);
  const detectHeaderIndex = () => {
    for (let i = 0; i < firstN; i++) {
      const row = arrays[i].map((c) => String(c || "").toLowerCase()).join(" ");
      if (/(name|email|e-?mail|phone|mobile|contact|location|city|job title|position)/.test(row)) return i;
    }
    return 0;
  };

  const headerIndex = detectHeaderIndex();
  const headerRow = arrays[headerIndex].map((h, idx) => (h ? String(h).trim() : `col_${idx}`));
  const dataRows = arrays.slice(headerIndex + 1);

  const objs = dataRows.map((r) => {
    const obj = {};
    headerRow.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    return obj;
  });

  return objs;
};

function sanitize(v) {
  if (!v) return "";
  let s = String(v).trim();
  // remove surrounding quotes/apostrophes
  if ((s.startsWith("\'") && s.endsWith("\'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  // normalize phone: keep + and digits and spaces
  return s;
}

function sanitizePhone(v) {
  if (!v) return "";
  let s = String(v).trim();
  if ((s.startsWith("\'") && s.endsWith("\'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  // keep + and digits only
  const cleaned = s.replace(/[^+\d]/g, "");
  return cleaned;
}

export default function Recruiter() {
  const [loading, setLoading] = useState(false);
  const [sourceData, setSourceData] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [error, setError] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const onSourceClick = (source) => {
    setActiveSource(source);
    setSourceData([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    // automatically fetch sample or API data for the selected source
    fetchSource(source);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      console.log("Recruiter.handleFile - file selected:", f.name, "source:", activeSource);
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const json = parseSheetToJson(sheet);
        const mapped = (json || []).map(mapRowToModel);
        console.log(`Recruiter.handleFile - parsed ${mapped.length} rows`);
        // persist then reload saved leads from server
        try {
          console.log("Recruiter.handleFile - posting to /recruiter/import", { source: activeSource || "website", count: mapped.length });
          await API.post(`/recruiter/import`, { source: activeSource || "website", leads: mapped });
          const listResp = await API.get(`/recruiter/list`, { params: { source: activeSource || "website" } });
          setSourceData((listResp.data && listResp.data.data) || mapped);
        } catch (err) {
          console.error("Failed to persist or reload leads", err?.response?.data || err.message || err);
          setSourceData(mapped);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to parse file", err);
        setError("Failed to parse Excel file. Make sure it's a valid XLSX/XLS/CSV.");
        setSourceData([]);
      }
      finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(f);
  };

  const fetchSource = async (source) => {
    if (!source) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/recruiter/source`, { params: { source } });
      const data = res.data?.data || [];
      const mapped = (data || []).map(mapRowToModel);
      // persist data returned from API into DB and then reload persisted rows
      try {
        await API.post(`/recruiter/import`, { source, leads: mapped });
        const listResp = await API.get(`/recruiter/list`, { params: { source } });
        setSourceData((listResp.data && listResp.data.data) || mapped);
      } catch (err) {
        console.error("Failed to persist or reload API leads", err?.response?.data || err.message || err);
        setSourceData(mapped);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load");
      setSourceData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    // If already a Date
    if (d instanceof Date) {
      if (isNaN(d.valueOf())) return "";
      return d.toLocaleDateString();
    }
    // If ISO string or numeric string
    const s = String(d).trim();
    if (!s) return "";
    // try parse
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed).toLocaleDateString();
    return s; // fallback: show original string
  };

  // On mount: load persisted leads so table shows after a page refresh
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
        try {
          const listResp = await API.get(`/recruiter/list`);
          if (!mounted) return;
          setSourceData((listResp.data && listResp.data.data) || []);
      } catch (err) {
        console.error("Failed to load persisted leads on mount", err?.response?.data || err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />

      <div className="flex-1 p-6">
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-medium text-gray-900">Recruiter — Leads</h1>
    <p className="text-sm text-gray-500 mt-1">Import and manage candidate leads from job portals.</p>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => navigate('/recruiters')}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      Recruiters
    </button>
  </div>
</div>

<div className="mb-6">
  <p className="text-sm text-gray-500 mb-3">Select a source, then upload the Excel/CSV exported from that source to populate the table.</p>
  <div className="flex gap-2 flex-wrap">
    {SOURCES.map((s) => (
      <button
        key={s}
        onClick={() => onSourceClick(s)}
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
          activeSource === s
            ? "bg-[#7B42BC] text-white border-[#7B42BC]"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </button>
    ))}
  </div>
</div>

        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />

 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
    <div>
      <h3 className="text-[15px] font-medium text-gray-900">
        {activeSource ? `${activeSource.charAt(0).toUpperCase() + activeSource.slice(1)} results` : "Select a source"}
      </h3>
      {sourceData.length > 0 && (
        <p className="text-xs text-gray-500 mt-0.5">{sourceData.length} leads found</p>
      )}
    </div>
    <div className="flex items-center gap-2">
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7B42BC] border-t-transparent" />
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={!activeSource}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
          activeSource
            ? "bg-[#7B42BC] text-white border-[#7B42BC] hover:bg-[#6B35A9]"
            : "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      >
        ↑ Upload Excel
      </button>
      <button
        onClick={() => fetchSource(activeSource)}
        disabled={!activeSource}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          activeSource
            ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            : "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      >
        Use API
      </button>
    </div>
  </div>

  {error && (
    <div className="mx-6 mt-4 rounded-lg bg-[#FCEBEB] border border-[#F09595] px-4 py-3 text-sm text-[#791F1F]">
      {error}
    </div>
  )}

  {!loading && sourceData.length === 0 && (
    <div className="py-14 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-lg">↑</div>
      <p className="text-sm font-medium text-gray-600">No leads yet</p>
      <p className="text-xs text-gray-400 mt-1">Select a source and upload an Excel / CSV file.</p>
    </div>
  )}

  {sourceData.length > 0 && (
    <div className="overflow-auto max-h-[60vh]">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {FIXED_COLUMNS.map((col) => (
              <th key={col.key} className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sourceData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-gray-900">{row.name}</td>
              <td className="px-5 py-3 text-xs text-gray-500">{row.email}</td>
              <td className="px-5 py-3 text-sm text-gray-700">{row.phone}</td>
              <td className="px-5 py-3">
                {row.jobTitle ? (
                  <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#3C3489]">
                    {row.jobTitle}
                  </span>
                ) : <span className="text-xs text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3 text-xs text-gray-500">{formatDate(row.createdAt || row.date)}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => setDetailRow(row)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEEDFE] border border-[#AFA9EC] px-3 py-1.5 text-xs font-medium text-[#3C3489] hover:bg-[#CECBF6] transition-colors"
                >
                  View details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

        {/* Details modal */}
{detailRow && (
  <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
    <div className="bg-white rounded-xl w-[600px] max-w-full shadow-xl overflow-hidden">
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-[15px] font-medium text-gray-900">Candidate details</h2>
          <p className="text-xs text-gray-500 mt-0.5">{detailRow.name || "Lead profile"}</p>
        </div>
        <button
          onClick={() => setDetailRow(null)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-3">
        {[
          ["Name", detailRow.name],
          ["Email", detailRow.email],
          ["Phone", detailRow.phone],
          ["Location", detailRow.location],
          ["Experience", detailRow.experience],
          ["Education", detailRow.education],
          ["Job title", detailRow.jobTitle],
          ["Job location", detailRow.jobLocation],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">{label}</div>
            <div className="text-sm text-gray-900">{value || <span className="text-gray-400">—</span>}</div>
          </div>
        ))}
        <div className="col-span-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">Submitted date</div>
          <div className="text-sm text-gray-900">{formatDate(detailRow.createdAt || detailRow.date) || <span className="text-gray-400">—</span>}</div>
        </div>
      </div>
    </div>
  </div>
)}
        
      </div>
    </div>
  );
}
