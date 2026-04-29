import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddModal,
  addEmployee,
  HR_DEPT_CONFIG,
} from "../../features/hrSlice";

export default function AddEmployeeModal() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hr.employees);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    dept: "homecare",
    service: "Home Nursing", // Default service, will be set properly on mount
    role: "",
    doj: "",
    dob: "",
    gender: "Male",
    blood: "A+",
    email: "",
    aadhaar: "",
    address: "",
    salary: "",
    manager: "",
    emptype: "Full-Time",
    shift: "Day (9am–6pm)",
    qual: "",
    emname: "",
    emmobile: "",
    emrel: "Spouse",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDeptChange = (e) => {
    const dept = e.target.value;
    const deptObj = HR_DEPT_CONFIG[dept];
    setFormData((prev) => ({
      ...prev,
      dept,
      service: deptObj?.services?.[0] || "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    // Check for duplicate mobile number
    if (formData.mobile.trim()) {
      const mobileExists = employees.some(
        (emp) => emp.mobile === formData.mobile.trim()
      );
      if (mobileExists) {
        newErrors.mobile = "⚠️ Employee with this mobile number already exists!";
      }
    }

    // Check for duplicate aadhaar number
    if (formData.aadhaar.trim()) {
      const aadhaarExists = employees.some(
        (emp) => emp.aadhaar === formData.aadhaar.trim()
      );
      if (aadhaarExists) {
        newErrors.aadhaar = "⚠️ Employee with this Aadhaar number already exists!";
      }
    }

    return newErrors;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    const dept_pfx = {
      homecare: "HC",
      healthcare: "HCC",
      calls: "CL",
      it: "IT",
      nonit: "NIT",
      labour: "LB",
    };

    // Don't generate ID here - let backend do it
    const newEmployee = { ...formData, status: "Present" };

    try {
      // Dispatch and wait for the async thunk result
      const result = await dispatch(addEmployee(newEmployee));
      
      // Check if the action was rejected
      if (result.type.endsWith('/rejected')) {
        alert(`❌ Error: ${result.payload || 'Failed to save employee'}`);
        return;
      }
      
      dispatch(closeAddModal());
      
      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-20 right-6 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg";
      toast.textContent = `✅ ${formData.name} added successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      alert(`❌ Error saving employee: ${error.message}`);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectClass = inputClass;
  const labelClass = "block text-sm font-semibold text-gray-900 mb-1";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
          </div>
          <button
            onClick={() => dispatch(closeAddModal())}
            className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-8 h-8 rounded flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className={`${inputClass} ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <select
                  name="blood"
                  value={formData.blood}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg}>{bg}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className={labelClass}>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className={`${inputClass} ${errors.mobile ? "border-red-500" : ""}`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  placeholder="XXXX XXXX XXXX"
                  className={`${inputClass} ${errors.aadhaar ? "border-red-500" : ""}`}
                />
                {errors.aadhaar && (
                  <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Qualification</label>
                <input
                  type="text"
                  name="qual"
                  value={formData.qual}
                  onChange={handleInputChange}
                  placeholder="e.g. GNM, B.Sc, MBA"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Residential Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Door No, Street, Area, City, Pincode"
                  rows="3"
                  className={`${inputClass} resize-none ${errors.address ? "border-red-500" : ""}`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Department *</label>
                <select
                  name="dept"
                  value={formData.dept}
                  onChange={handleDeptChange}
                  className={selectClass}
                >
                  {Object.entries(HR_DEPT_CONFIG).map(([key, dept]) => (
                    <option key={key} value={key}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Service Type *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  {HR_DEPT_CONFIG[formData.dept]?.services?.map((service) => (
                    <option key={service}>{service}</option>
                  )) || []}
                </select>
              </div>
              <div>
                <label className={labelClass}>Designation / Role *</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Caregiver"
                  className={`${inputClass} ${errors.role ? "border-red-500" : ""}`}
                />
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Date of Joining *</label>
                <input
                  type="date"
                  name="doj"
                  value={formData.doj}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <select
                  name="emptype"
                  value={formData.emptype}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  {[
                    "Full-Time",
                    "Part-Time",
                    "Contract",
                    "Daily Wage",
                    "Internship",
                  ].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  {[
                    "Morning (6am–2pm)",
                    "Day (9am–6pm)",
                    "Evening (2pm–10pm)",
                    "Night (10pm–6am)",
                    "Flexible",
                  ].map((shift) => (
                    <option key={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Monthly Salary (₹)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="18000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Reporting Manager</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  placeholder="Manager name"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  name="emname"
                  value={formData.emname}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact Mobile</label>
                <input
                  type="tel"
                  name="emmobile"
                  value={formData.emmobile}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Relation</label>
                <select
                  name="emrel"
                  value={formData.emrel}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  {[
                    "Spouse",
                    "Parent",
                    "Sibling",
                    "Friend",
                    "Other",
                  ].map((rel) => (
                    <option key={rel}>{rel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Remarks</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any notes"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => dispatch(closeAddModal())}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
               Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
