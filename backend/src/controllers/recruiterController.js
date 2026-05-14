// Controller for recruiter integration endpoints
import axios from "axios";
import RecruitLead from "../models/RecruitLead.js";

const SUPPORTED = ["indeed", "linkedin", "naukri", "monster"];

export const getSource = async (req, res) => {
  try {
    const source = (req.query.source || "").toLowerCase();
    if (!source) return res.status(400).json({ message: "source query param required" });
    if (!SUPPORTED.includes(source)) return res.status(400).json({ message: "unsupported source" });

    const envKeyName = `${source.toUpperCase()}_API_KEY`;
    const apiKey = process.env[envKeyName];

    // If no API key is configured, return sample data and indicate purchase requirement
    const sample = [
    //   { title: "Sample Lead 1", name: "Alice Johnson", email: "alice@example.com", source },
    //   { title: "Sample Lead 2", name: "Bob Kumar", email: "bob@example.com", source },
     ];

    if (!apiKey) {
      return res.status(200).json({
        source,
        requiresPurchase: true,
        message: `No API key configured for ${source}. Set environment variable ${envKeyName} after purchasing access. Returning sample data for UI testing.`,
        data: sample,
      });
    }

    // NOTE: Third-party API integration should be implemented here.
    // For safety we don't implement live scrapers. Return a placeholder telling developer what to add.
    return res.status(501).json({
      source,
      requiresPurchase: false,
      message: `API key found for ${source} but integration is not implemented. Add the provider-specific HTTP calls in recruiterController.getSource.`,
    });
  } catch (err) {
    console.error("recruiter.getSource error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const importLeads = async (req, res) => {
  try {
    const { source, leads } = req.body;
    console.log("importLeads called", { source, count: Array.isArray(leads) ? leads.length : 0 });
    if (Array.isArray(leads) && leads.length > 0) console.log("sample lead:", leads[0]);
    if (!source) return res.status(400).json({ message: "source required in body" });
    if (!Array.isArray(leads)) return res.status(400).json({ message: "leads must be an array" });

    const results = { created: 0, updated: 0, errors: 0 };

    const safeParseDate = (val) => {
      if (!val) return null;
      // if already a Date
      if (val instanceof Date) {
        return isNaN(val.valueOf()) ? null : val;
      }
      // try numeric timestamp or Excel serial
      if (typeof val === "number" && !isNaN(val)) {
        // If it's a large number, treat as milliseconds since epoch
        if (val > 1e12) {
          const d = new Date(val);
          if (!isNaN(d.valueOf())) return d;
        }
        // If it's in seconds since epoch
        if (val > 1e9 && val <= 1e12) {
          const d = new Date(val * 1000);
          if (!isNaN(d.valueOf())) return d;
        }
        // Otherwise, likely an Excel serial date (days since 1899-12-31 with fractional day)
        // Convert Excel serial to JS timestamp: (serial - 25569) * 86400 * 1000
        try {
          const ms = (val - 25569) * 86400 * 1000;
          const d = new Date(ms);
          if (!isNaN(d.valueOf())) return d;
        } catch (e) {
          // fallthrough
        }
        return null;
      }
      // string parsing: trim and try common formats
      const s = String(val).trim();
      if (!s) return null;
      // try ISO parse
      const d1 = new Date(s);
      if (!isNaN(d1.valueOf())) return d1;

      // numeric-like strings (e.g., Excel serials represented as strings)
      if (/^\d+(?:\.\d+)?$/.test(s)) {
        const n = Number(s);
        // reuse numeric logic by recursion
        return safeParseDate(n);
      }
      // try dd-mm-yyyy or dd/mm/yyyy
      const parts = s.match(/(\d{1,4})[^\d](\d{1,2})[^\d](\d{1,4})/);
      if (parts) {
        // try rearranging
        const p = parts.slice(1);
        // if year is first (yyyy-mm-dd)
        if (p[0].length === 4) {
          const iso = `${p[0].padStart(4, "0")}-${p[1].padStart(2, "0")}-${p[2].padStart(2, "0")}`;
          const d2 = new Date(iso);
          if (!isNaN(d2.valueOf())) return d2;
        }
        // try day-month-year
        const iso2 = `${p[2].padStart(4, "0")}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
        const d3 = new Date(iso2);
        if (!isNaN(d3.valueOf())) return d3;
      }
      return null;
    };

    for (const raw of leads) {
      try {
        const match = {};
        if (raw.email) match.email = String(raw.email).toLowerCase();
        if (raw.phone) match.phone = String(raw.phone);

        // Prefer matching by email, then phone; if none present, insert as new
        let existing = null;
        if (match.email) existing = await RecruitLead.findOne({ source, email: match.email });
        if (!existing && match.phone) existing = await RecruitLead.findOne({ source, phone: match.phone });

        // Parse date once and avoid overwriting DB date with invalid/empty values
        const parsedDate = safeParseDate(raw.date) || safeParseDate(raw.appliedDate) || null;
        console.log("importLeads - raw date:", raw.date, "parsed:", parsedDate);

        const docBase = {
          source,
          sourceId: raw.sourceId || raw.id || null,
          name: raw.name || raw.Name || "",
          email: raw.email ? String(raw.email).toLowerCase() : "",
          phone: raw.phone || raw.Phone || raw.mobile || "",
          jobTitle: raw.jobTitle || raw.title || raw.position || "",
          location: raw.location || raw.city || "",
          experience: raw.experience || raw.exp || "",
          education: raw.education || raw.degree || "",
          jobLocation: raw.jobLocation || raw["job location"] || "",
          raw,
        };

        if (existing) {
          // Build $set only with fields that are non-empty, and include date only if parsed
          const setDoc = {};
          Object.keys(docBase).forEach((k) => {
            if (docBase[k] !== undefined && docBase[k] !== null && docBase[k] !== "") setDoc[k] = docBase[k];
          });
          if (parsedDate) setDoc.date = parsedDate;

          if (Object.keys(setDoc).length > 0) {
            await RecruitLead.updateOne({ _id: existing._id }, { $set: setDoc });
          }
          results.updated += 1;
        } else {
          // For new documents, include parsed date if available
          if (parsedDate) docBase.date = parsedDate;
          await RecruitLead.create(docBase);
          results.created += 1;
        }
      } catch (err) {
        console.error("Error importing lead", err);
        results.errors += 1;
      }
    }

    return res.status(200).json({ message: "Import completed", results });
  } catch (err) {
    console.error("importLeads error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeads = async (req, res) => {
  try {
    const source = (req.query.source || "").toLowerCase();
    const status = (req.query.status || "").toLowerCase();
    const limit = Math.min(1000, parseInt(req.query.limit || "200", 10));
    const query = {};
    if (source) query.source = source;
    // by default do not return selected/rejected in main list
    if (status) {
      query.status = status;
    } else {
      query.status = { $nin: ['selected', 'rejected'] };
    }

    const docs = await RecruitLead.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    // format date fields as ISO strings for client
    const out = docs.map((d) => ({
      ...d,
      date: d.date ? d.date.toISOString() : d.date,
    }));

    return res.status(200).json({ data: out });
  } catch (err) {
    console.error("getLeads error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ message: 'id and status required' });
    if (!['open','selected','rejected'].includes(status)) return res.status(400).json({ message: 'invalid status' });

    const doc = await RecruitLead.findById(id);
    if (!doc) return res.status(404).json({ message: 'not found' });

    doc.status = status;
    await doc.save();

    return res.status(200).json({ message: 'updated', data: doc });
  } catch (err) {
    console.error('markStatus error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
