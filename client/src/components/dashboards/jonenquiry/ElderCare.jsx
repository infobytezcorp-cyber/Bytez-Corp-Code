import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "../../../features/jobSlice";

const COLORS = [
    { bg: "bg-blue-50", text: "text-blue-800" },
    { bg: "bg-emerald-50", text: "text-emerald-800" },
    { bg: "bg-amber-50", text: "text-amber-800" },
    { bg: "bg-pink-50", text: "text-pink-800" },
    { bg: "bg-purple-50", text: "text-purple-800" },
];

const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const fmtDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

// ── Field ──────────────────────────────────────────────────────────────────
const Field = ({ label, value, full }) => (
    <div className={full ? "col-span-2" : ""}>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
);


// ── Modal ──────────────────────────────────────────────────────────────────
const Modal = ({ item, onClose }) => {
    if (!item) return null;
    const v = item.visitorId || {};
    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-[440px] overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <span className="text-sm font-medium">Visitor details</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Avatar row */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center text-base font-medium shrink-0">
                            {initials(v.name)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{v.name}</p>
                            <p className="text-xs text-gray-400">{item.jobRole}</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Personal info</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Email" value={item.email} />
                            <Field label="Phone" value={v.phone} />
                            <Field label="Aadhaar" value={item.aadhaarnumber} />
                            <Field label="Blood group" value={item.bloodGroup} />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Job Details */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Job details</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Job role" value={item.jobRole} />
                            <Field label="Experience" value={item.experience} />
                            <Field label="Purpose" value={item.purpose} />
                            <Field label="Check-in" value={fmtDate(v.checkInTime)} />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Address */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Address</p>
                        <p className="text-sm text-gray-500">{item.address || "—"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PER_PAGE = 5;

const ElderCare = () => {
    const dispatch = useDispatch();
    const { data = [], loading } = useSelector((state) => state.jobs);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        dispatch(fetchJobs());
    }, [dispatch]);

    // MAIN CHANGE: Filter only "Elder Care"
    const filtered = data
        // Elder Care filter
        .filter((d) => d.jobRole?.toLowerCase() === "elder care")

        //  Search filter
        .filter((d) =>
            d.visitorId?.name?.toLowerCase().includes(search.toLowerCase())
        )

        //  Date Range filter
        .filter((d) => {
            if (!fromDate && !toDate) return true;

            const checkIn = new Date(d.visitorId?.checkInTime);

            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            // Set end of day for "to"
            if (to) to.setHours(23, 59, 59, 999);

            if (from && to) return checkIn >= from && checkIn <= to;
            if (from) return checkIn >= from;
            if (to) return checkIn <= to;

            return true;
        });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    if (loading)
        return (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                Loading...
            </div>
        );

    return (
        <>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium">Elder Care Requests</h2>
                        <span className="text-[11px] bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
                            {filtered.length} records
                        </span>
                    </div>

                    <input
                        type="text"
                        placeholder="Search name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 outline-none w-48"
                    />
                    {/* From Date */}
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            setPage(1);
                        }}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50"
                    />

                    {/* To Date */}
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            setPage(1);
                        }}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50"
                    />

                    {/* Clear */}
                    <button
                        onClick={() => {
                            setFromDate("");
                            setToDate("");
                        }}
                        className="text-xs px-3 py-1.5 border rounded-lg"
                    >
                        Clear
                    </button>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            {["Visitor", "Phone", "Check-in", "Service", "Action"].map((h) => (
                                <th
                                    key={h}
                                    className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-10 text-sm text-gray-400"
                                >
                                    No Elder Care records found
                                </td>
                            </tr>
                        ) : (
                            rows.map((item, i) => {
                                const c = COLORS[i % COLORS.length];
                                const v = item.visitorId || {};

                                return (
                                    <tr
                                        key={item._id}
                                        className="border-t border-gray-50 hover:bg-gray-50"
                                    >
                                        {/* Visitor */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-xs font-medium`}
                                                >
                                                    {initials(v.name)}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {v.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-5 py-3 text-xs text-gray-500">
                                            {v.phone}
                                        </td>

                                        {/* Check-in */}
                                        <td className="px-5 py-3 text-xs text-gray-500">
                                            {fmtDate(v.checkInTime)}
                                        </td>

                                        {/* Service */}
                                        <td className="px-5 py-3">
                                            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full">
                                                {item.jobRole}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => setSelected(item)}
                                                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                        Page {page} of {totalPages}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-xs px-3 py-1.5 border rounded-lg disabled:opacity-40 cursor-pointer"
                        >
                            ← Prev
                        </button>

                        <span className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg">
                            {page}
                        </span>

                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="text-xs px-3 py-1.5 border rounded-lg disabled:opacity-40 cursor-pointer"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal item={selected} onClose={() => setSelected(null)} />
        </>
    );
};

export default ElderCare;