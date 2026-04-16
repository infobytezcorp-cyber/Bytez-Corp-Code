import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "../../../features/jobSlice";

const JobEnquiry = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.jobs);

  const [selected, setSelected] = useState(null); // 🔥 for details view

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b">
        <h2 className="font-medium">Job Enquiries</h2>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Check-in</th>
            <th className="px-5 py-3">Job Role</th>
            <th className="px-5 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-t hover:bg-gray-50">
              <td className="px-5 py-3">{item.visitorId?.name}</td>
              <td className="px-5 py-3">{item.visitorId?.phone}</td>
              <td className="px-5 py-3">
                {new Date(item.visitorId?.checkInTime).toLocaleString()}
              </td>
              <td className="px-5 py-3">{item.jobRole}</td>

              {/* 🔥 View Button */}
              <td className="px-5 py-3">
                <button
                  onClick={() => setSelected(item)}
                  className="text-xs px-3 py-1.5 border rounded-lg"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔥 DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-[500px] relative">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">Full Details</h3>

            <div className="space-y-2 text-sm">

              <p><b>Name:</b> {selected.visitorId?.name}</p>
              <p><b>Phone:</b> {selected.visitorId?.phone}</p>
              <p><b>Email:</b> {selected.email}</p>
              <p><b>Author Number:</b> {selected.authorNumber}</p>
              <p><b>Blood Group:</b> {selected.bloodGroup}</p>

              <p><b>Check-in:</b> {new Date(selected.visitorId?.checkInTime).toLocaleString()}</p>

              <hr />

              <p><b>Job Role:</b> {selected.jobRole}</p>
              <p><b>Experience:</b> {selected.experience}</p>
              <p><b>Purpose:</b> {selected.purpose}</p>

              <hr />

              <p><b>Address:</b> {selected.address}</p>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobEnquiry;