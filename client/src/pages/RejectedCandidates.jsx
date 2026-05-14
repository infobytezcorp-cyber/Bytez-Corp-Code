import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function RejectedCandidates() {
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRejectedCandidates = async () => {
    setLoading(true);
    try {
      const res = await API.get("/recruiters/list?status=rejected");
      setRejectedCandidates((res.data && res.data.data) || []);
    } catch (e) {
      console.error("Failed to load rejected candidates", e);
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (id, status) => {
    try {
      await API.patch(`/recruiters/update-status/${id}`, { status });
      await loadRejectedCandidates();
    } catch (e) {
      console.error(`Failed to update candidate status to ${status}`, e);
      alert(`Failed to update candidate status to ${status}`);
    }
  };

  useEffect(() => {
    loadRejectedCandidates();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rejected Candidates</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-1 rounded-md border bg-white">
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        {loading && <p>Loading...</p>}
        {rejectedCandidates.length === 0 && !loading && (
          <p className="text-sm text-slate-500">No rejected candidates yet.</p>
        )}
        {rejectedCandidates.length > 0 && (
          <div className="overflow-auto max-h-[60vh]">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Name</th>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Email</th>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Phone</th>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Job Title</th>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Submitted Date</th>
                  <th className="px-3 py-2 text-left text-sm font-medium border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rejectedCandidates.map((candidate, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-3 py-2 text-sm align-top border-b">{candidate.name}</td>
                    <td className="px-3 py-2 text-sm align-top border-b">{candidate.email}</td>
                    <td className="px-3 py-2 text-sm align-top border-b">{candidate.phone}</td>
                    <td className="px-3 py-2 text-sm align-top border-b">{candidate.jobTitle}</td>
                    <td className="px-3 py-2 text-sm align-top border-b">{new Date(candidate.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-3 py-2 text-sm align-top border-b flex gap-2">
                      <button
                        onClick={() => updateCandidateStatus(candidate._id, "selected")}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}