import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { submitWorkUpdate } from "../features/workUpdateSlice";

const WORK_TYPES = ["Patient Visit", "Call", "Documentation", "Travel", "Other"];

const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

export default function StaffWorkUpdateForm({ staffSession, tasks = [], onSuccess }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    taskId: tasks[0]?._id || tasks[0]?.id || "",
    workDescription: "",
    duration: 60,
    workType: "Other",
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const activeTasks = tasks.filter(
    (t) => t.status !== "Done" && t.status !== "Completed" && t.status !== "Rejected"
  );

  const handleFileChange = async (e) => {
    setUploading(true);
    const files = Array.from(e.target.files);
    const processed = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        data: await fileToBase64(file),
        uploadedAt: new Date().toISOString(),
        description: file.name,
      }))
    );
    setAttachments((prev) => [...prev, ...processed]);
    setUploading(false);
  };

  const removeAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError("");
    if (!form.workDescription.trim()) {
      setError("Work description is required.");
      return;
    }
    if (!form.duration || form.duration < 1 || form.duration > 60) {
      setError("Duration must be between 1 and 60 minutes.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedTask = tasks.find(
        (t) => (t._id || t.id) === form.taskId
      );

      const payload = {
        staffEmpId: staffSession.empId,
        staffName: staffSession.empName,
        taskId: form.taskId || null,
        taskTitle: selectedTask?.title || "",
        workDescription: form.workDescription.trim(),
        duration: parseInt(form.duration),
        workType: form.workType,
        proofAttachments: attachments,
      };

      const result = await dispatch(submitWorkUpdate(payload));
      if (submitWorkUpdate.fulfilled.match(result)) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.payload?.message || "Submission failed. Try again.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="text-5xl">✅</div>
        <p className="font-bold text-green-700 text-lg">Update Submitted!</p>
        <p className="text-sm text-gray-500">Admin will review your update.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Linked Task
        </label>
        {activeTasks.length === 0 ? (
          <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
            No active tasks. Update will be submitted without a task link.
          </div>
        ) : (
          <select
            value={form.taskId}
            onChange={(e) => setForm((p) => ({ ...p, taskId: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-blue-400"
          >
            <option value="">— No specific task —</option>
            {activeTasks.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.title || "Untitled"} ({t.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Work Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Work Type
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setForm((p) => ({ ...p, workType: type }))}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${
                form.workType === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Duration: <span className="text-blue-600 font-bold">{form.duration} min</span>
        </label>
        <input
          type="range"
          min={1}
          max={60}
          value={form.duration}
          onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>1 min</span>
          <span>30 min</span>
          <span>60 min</span>
        </div>
      </div>

      {/* Work Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Work Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.workDescription}
          onChange={(e) =>
            setForm((p) => ({ ...p, workDescription: e.target.value }))
          }
          rows={3}
          maxLength={1000}
          placeholder="What did you do in the last hour? Be specific..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-blue-400 resize-none"
        />
        <p className="text-[10px] text-gray-400 text-right mt-0.5">
          {form.workDescription.length}/1000
        </p>
      </div>

      {/* Proof Attachments */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Proof / Attachments (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            >
              <span>📎 {att.fileName}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-red-400 hover:text-red-600 ml-1 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition">
          {uploading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>📷 Add Photo / File</>
          )}
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
          ❌ {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          "📤 Submit Work Update"
        )}
      </button>

      <p className="text-center text-[10px] text-gray-400">
        Submit every hour while on duty. Admin will review and approve.
      </p>
    </div>
  );
}