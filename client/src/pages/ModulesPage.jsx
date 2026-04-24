const modules = [
  {
    section: "CRM & SALES",
    items: [
      { icon: "🎯", title: "Leads & Enquiries", desc: "Inbound calls, WA, website. Telecaller notes & follow-ups.", tab: "leads" },
      { icon: "📋", title: "Sales Pipeline", desc: "Kanban: New → Quoted → Won. Drag & drop deal stages.", tab: "pipeline" },
      { icon: "💬", title: "WhatsApp CRM", desc: "Engage leads on WhatsApp. Broadcasts, chatbot, multi-agent inbox.", tab: "whatsapp" },
      { icon: "📣", title: "Marketing & Ads", desc: "FB/Google ad tracking. Lead source analytics. Campaign ROI.", tab: "marketing" },
      { icon: "💼", title: "Quotations", desc: "Service packages & pricing. PDF auto-generated and sent.", tab: "quotations" },
    ],
  },
  {
    section: "PATIENT CARE",
    items: [
      { icon: "👴", title: "Elder Care Patients", desc: "Full records, conditions, care plans, daily vitals.", tab: "eldercare" },
      { icon: "🏠", title: "Home Care", desc: "Visit scheduling, caregiver assignment, visit reports.", tab: "homecare" },
      { icon: "👤", title: "Patient Profile", desc: "360° view: timeline, billing, care plan, call logs.", tab: "patient-profile" },
      { icon: "📝", title: "Care Plans", desc: "Individualised care protocols per patient diagnosis.", tab: "careplans" },
      { icon: "🩺", title: "Doctors & Schedule", desc: "Doctor profiles, weekly schedule, visit tracking.", tab: "doctors" },
      { icon: "👩‍⚕️", title: "Caregivers / Nurses", desc: "Assign to patients, attendance, performance, salary.", tab: "caregivers" },
      { icon: "🥗", title: "Patient Diet", desc: "Dietician-approved meal plans per patient condition.", tab: "diet" },
      { icon: "⭐", title: "Feedback & Surveys", desc: "Family feedback, NPS, complaint management.", tab: "feedback" },
    ],
  },
  {
    section: "VISITOR MANAGEMENT",
    items: [
      { icon: "🚪", title: "Visitor Management", desc: "Kiosk check-in/out. Visitor log. Host notification.", tab: "visitors" },
      { icon: "🪪", title: "Gate Pass", desc: "Auto-printed/digital pass with QR code for exit scan.", tab: "gatepass" },
      { icon: "📨", title: "Pre-Invitation", desc: "Send invite link via WhatsApp. Visitor pre-fills details.", tab: "preinvitation" },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { icon: "🛒", title: "Purchase & Vendors", desc: "Medical supplies, PO creation, vendor list.", tab: "purchase" },
      { icon: "📦", title: "Inventory", desc: "Stock levels, low-stock alerts, auto-reorder triggers.", tab: "inventory" },
      { icon: "⚙️", title: "Service Packages", desc: "Elder Care Basic, Plus, 24hr — pricing & inclusions.", tab: "services" },
      { icon: "🧹", title: "Housekeeping", desc: "Daily schedules, area-wise tasks, consumable stock.", tab: "housekeeping" },
      { icon: "⚠️", title: "Incidents / CAPA", desc: "Report incidents, assign root cause, track CAPA actions.", tab: "incidents" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { icon: "🧾", title: "Billing & Invoices", desc: "Auto monthly invoices, payment tracking, reminders.", tab: "billing" },
      { icon: "💳", title: "Payments", desc: "UPI, bank, cash payments logged against invoices.", tab: "payments" },
      { icon: "📊", title: "Accounts & P&L", desc: "Revenue, expenses, profit by service line. GST.", tab: "accounts" },
      { icon: "💸", title: "Expense Management", desc: "Staff claims, category-wise tracking, approvals.", tab: "expenses" },
    ],
  },
  {
    section: "HR & COMMUNICATION",
    items: [
      { icon: "👥", title: "Staff & HR", desc: "Employee records, roles, documents, leave management.", tab: "staff" },
      { icon: "💰", title: "Payroll & Salary", desc: "Monthly salary, deductions, payslip generation.", tab: "payroll" },
      { icon: "🕐", title: "Attendance Mgmt", desc: "Present/Absent/WFH tracking with mobile check-in.", tab: "attendance" },
      { icon: "📍", title: "Activity Tracking", desc: "Field staff GPS, daily task log, performance tracking.", tab: "activity" },
      { icon: "📞", title: "Call Tracker", desc: "Inbound/outbound calls, recordings, agent performance.", tab: "calls" },
    ],
  },
  {
    section: "COMPLIANCE & QUALITY",
    items: [
      { icon: "📋", title: "Compliance / NABH", desc: "NABH checklists, KPIs, regulatory compliance tracking.", tab: "compliance" },
      { icon: "🔍", title: "Audit Management", desc: "Internal/external audits, findings, action tracking.", tab: "audit" },
      { icon: "🦠", title: "Risk & Infection Ctrl", desc: "Infection logs, disinfection schedules, risk matrix.", tab: "risk" },
      { icon: "📄", title: "Licenses & Insurance", desc: "All certificates with expiry alerts. Renewal reminders.", tab: "licenses" },
    ],
  },
  {
    section: "ANALYTICS",
    items: [
      { icon: "📈", title: "Reports & Analytics", desc: "KPIs, revenue trends, caregiver performance, occupancy.", tab: "reports" },
      { icon: "🎯", title: "KPI Dashboard", desc: "Real-time KPI tracking across all departments.", tab: "kpi" },
    ],
  },
];

export default function ModulesPage({ setShowModules }) {
  return (
    <div className="p-4 space-y-2">
      <button
        onClick={() => setShowModules(false)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
        💡 Complete ERP module structure!.
      </div>

      {modules.map((group) => (
        <div key={group.section}>
          <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase border-b border-gray-200 pb-1 mb-3 mt-6">
            {group.section}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {group.items.map((mod) => (
              <button
                key={mod.tab}
                onClick={() => setActiveTab(mod.tab)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-gray-400"
              >
                <span className="text-3xl mb-2">{mod.icon}</span>
                <span className="text-sm font-medium text-gray-800 leading-tight">{mod.title}</span>
                <span className="text-[11px] text-gray-400 mt-1 leading-snug">{mod.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}