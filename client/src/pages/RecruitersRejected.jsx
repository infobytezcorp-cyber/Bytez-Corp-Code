import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/dashboards/Sidebar";
import API from "../services/api";

const formatSubmittedDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
};

export default function RecruitersRejected(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async ()=>{
    setLoading(true);
    try{
      const res = await API.get('/recruiters/list', { params: { status: 'rejected' } });
      setItems((res.data && res.data.data) || []);
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Rejected candidates</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate(-1)} className="px-3 py-1 rounded-md border bg-white">Back</button>
            <button onClick={load} className="px-3 py-1 rounded-md border bg-white">Refresh</button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          {loading && <p>Loading...</p>}
          {items.length === 0 && !loading && <p className="text-sm text-slate-500">No rejected candidates.</p>}
          {items.length > 0 && (
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium border-b">Name</th>
                    <th className="px-3 py-2 text-left text-sm font-medium border-b">Email</th>
                    <th className="px-3 py-2 text-left text-sm font-medium border-b">Phone</th>
                    <th className="px-3 py-2 text-left text-sm font-medium border-b">Job Title</th>
                    <th className="px-3 py-2 text-left text-sm font-medium border-b">Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r,i)=> (
                    <tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}>
                      <td className="px-3 py-2 text-sm align-top border-b">{r.name}</td>
                      <td className="px-3 py-2 text-sm align-top border-b">{r.email}</td>
                      <td className="px-3 py-2 text-sm align-top border-b">{r.phone}</td>
                      <td className="px-3 py-2 text-sm align-top border-b">{r.jobTitle || r.previousRole || r.jobLookingFor || ''}</td>
                      <td className="px-3 py-2 text-sm align-top border-b">{formatSubmittedDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

