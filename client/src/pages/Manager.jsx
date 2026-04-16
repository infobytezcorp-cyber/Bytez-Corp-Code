import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Manager() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchMyAssignedTasks();
  }, []);

  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients");

    setClients(res.data);
  };

  const fetchMyAssignedTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks?assignedBy=my");

    setTasks(res.data);
  };

  return (
    <Layout>

      {/* 🔥 Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Total Clients</h2>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Active Clients</h2>
          <p className="text-2xl font-bold text-green-500">
            {clients.filter(c => c.status === "active").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Projects</h2>
          <p className="text-2xl font-bold">
            {clients.reduce((sum, c) => sum + (c.projectCount || 0), 0)}
          </p>
        </div>

      </div>

      {/* 📋 Tasks assigned by me */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Tasks I Assigned</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th>Title</th>
              <th>Assignee</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td>{t.title}</td>
                <td>{t.assignedTo?.[0]?.name || t.assignedTo?.[0]?.email}</td>
                <td>{t.deadline?.slice(0,10)}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📊 Clients Table */}
      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4">Clients Overview</h2>

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th>Company</th>
              <th>Industry</th>
              <th>Contact</th>
              <th>Projects</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">

                <td>{c.companyName}</td>
                <td>{c.industry}</td>
                <td>{c.contactName}</td>
                <td>{c.projectCount}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      c.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </Layout>
  );
}