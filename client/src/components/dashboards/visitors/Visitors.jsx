import React, { useEffect, useState } from 'react'
import axios from 'axios';

const API = import.meta.env.VITE_API_URL; // ✅ backend URL
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

function initials(name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const Visitors = () => {
    const [visitors, setVisitors] = useState([]);
    const [filter, setFilter] = useState("all");
    const [time, setTime] = useState(new Date());
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState("");

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/visitor`, {
                params: {
                    date: dateFilter
                }
            });
            setVisitors(res.data);
        } catch (e) {
            console.error("Failed to fetch visitors", e);
        } finally {
            setLoading(false);
        }
    };

    const checkout = async (id) => {
        try {
            await axios.put(`${API}/api/visitor/${id}/checkout`);
            fetchVisitors();
        } catch (e) {
            console.error("Checkout failed", e);
        }
    };

    useEffect(() => {
        fetchVisitors();
        const interval = setInterval(fetchVisitors, 30000); // every 30 sec
        return () => clearInterval(interval);
    }, [dateFilter]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filtered = visitors
        .filter((v) => filter === "all" || v.status === filter)
        .filter((v) =>
            search.trim() === "" ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.phone.includes(search)
        );

    const checkedIn = visitors.filter((v) => v.status === "Checked-In").length;
    const checkedOut = visitors.filter((v) => v.status === "Checked-Out").length;
    const today = visitors.filter((v) => {
        const d = new Date(v.checkInTime);
        const n = new Date();
        return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
    }).length;


    const handleRefresh = async () => {
        try {
            setLoading(true);

            // 1. Reset filters
            setDateFilter("");
            setSearch("");
            setFilter("all");

            // 2. Fetch new data
            await fetchVisitors();

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            Hospital Management
                        </p>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Visitor Dashboard
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                            {time.toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {time.toLocaleTimeString("en-IN")}
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total visitors", value: visitors.length, color: "text-gray-900" },
                        { label: "Currently inside", value: checkedIn, color: "text-green-700" },
                        { label: "Checked out", value: checkedOut, color: "text-gray-500" },
                        { label: "Today's entries", value: today, color: "text-gray-900" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-50 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-semibold ${stat.color}`}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {/* Table Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
                        <p className="text-base font-medium text-gray-900">Visitor log</p>
                        <div className="flex flex-wrap gap-2 items-center">

                            {/* Date Filter */}
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                            />

                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search name or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 w-52"
                            />
                            {/* Filter */}
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none"
                            >
                                <option value="all">All visitors</option>
                                <option value="Checked-In">Checked in</option>
                                <option value="Checked-Out">Checked out</option>
                            </select>
                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Refreshing...
                                    </span>
                                ) : (
                                    "↻ Refresh"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400">
                            No visitors found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left">
                                        {["Visitor", "Phone", "Check-in time", "Check-out time", "Status", "Action"].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((v) => (
                                        <tr key={v._id} className="hover:bg-gray-50 transition-colors">

                                            {/* Name + Avatar */}
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 shrink-0">
                                                        {initials(v.name)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {v.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {v.phone}
                                            </td>

                                            {/* Check-in Time */}
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {new Date(v.checkInTime).toLocaleString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>

                                            {/* Check-out Time + Duration */}
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {v.checkOutTime ? (() => {
                                                    const checkOut = new Date(v.checkOutTime);
                                                    const checkIn = new Date(v.checkInTime);
                                                    const diff = checkOut - checkIn;
                                                    const minutes = Math.floor(diff / (1000 * 60));
                                                    const hours = Math.floor(minutes / 60);
                                                    const remainingMinutes = minutes % 60;
                                                    const totalTime = hours > 0
                                                        ? `${hours} hr ${remainingMinutes} min`
                                                        : `${minutes} min`;
                                                    return (
                                                        <div>
                                                            <p>
                                                                {checkOut.toLocaleString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                            <p className={`text-xs font-medium mt-0.5 ${minutes > 120 ? "text-red-500" : "text-green-600"}`}>
                                                                {totalTime}
                                                            </p>
                                                        </div>
                                                    );
                                                })() : <span className="text-gray-300">—</span>}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-3">
                                                {v.status === "Checked-In" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                                        Inside
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                                        Checked out
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-3">
                                                {v.status === "Checked-In" ? (
                                                    <button
                                                        onClick={() => checkout(v._id)}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                                                    >
                                                        Check out
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>

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

export default Visitors;