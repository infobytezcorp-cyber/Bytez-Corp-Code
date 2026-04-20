// Enquiry Stage Constants
export const ENQUIRY_STAGES = {
  NEW: 'New Enquiry',
  CONTACT: 'Contact',
  PITCHING: 'Pitching',
  ENROLLED: 'Enrolled'
};

// Enquiry Lead Source Constants
export const ENQUIRY_LEADS = {
  // Online Sources
  WEBSITE: 'Website',
  WHATSAPP: 'Whatsapp',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  YELLOW_PAGE: 'Yellow page',
  MAIL: 'Mail',
  TAWK_TO: 'Tawk.to',
  META_CAMPAIGNS: 'Meta Campaigns',
  GOOGLE_CAMPAIGNS: 'Google Campaigns',
  // Offline Sources - Referral
  OLD_CLIENTS: 'Old clients',
  EXISTING_CLIENTS: 'Existing clients',
  // Offline Sources - Professional
  DOCTOR: 'Doctor',
  MEDICAL: 'Medical',
  NURSE: 'Nurse',
  // Offline Sources - Unprofessional
  COMPOUNDER: 'Compounder',
  PLUMBER: 'Plumber',
  ELECTRICIAN: 'Electrician',
  // Offline Sources - Events & Stalls
  CAMP: 'Camp',
  STALL: 'Stall',
  EVENT: 'Event',
  // Offline Sources - Business Partners
  BUSINESS_PARTNERS: 'Business partners'
};

// Care Type Options
export const CARE_TYPES = {
  DAY_CARE: 'Day Care',
  LIVE_IN: 'Live In',
  PART_TIME: 'Part Time',
  FULL_TIME: 'Full Time',
  RESIDENTIAL: 'Residential'
};

// Stage and Source options arrays for filters and dropdowns
export const STAGE_OPTIONS = [
  { value: null, label: 'All Stages' },
  { value: ENQUIRY_STAGES.NEW, label: ENQUIRY_STAGES.NEW },
  { value: ENQUIRY_STAGES.CONTACT, label: ENQUIRY_STAGES.CONTACT },
  { value: ENQUIRY_STAGES.PITCHING, label: ENQUIRY_STAGES.PITCHING },
  { value: ENQUIRY_STAGES.ENROLLED, label: ENQUIRY_STAGES.ENROLLED }
];

export const LEAD_OPTIONS = [
  { value: null, label: 'All Leads' },
  { category: 'Online', options: [
    { value: ENQUIRY_LEADS.WEBSITE, label: ENQUIRY_LEADS.WEBSITE },
    { value: ENQUIRY_LEADS.WHATSAPP, label: ENQUIRY_LEADS.WHATSAPP },
    { value: ENQUIRY_LEADS.FACEBOOK, label: ENQUIRY_LEADS.FACEBOOK },
    { value: ENQUIRY_LEADS.INSTAGRAM, label: ENQUIRY_LEADS.INSTAGRAM },
    { value: ENQUIRY_LEADS.LINKEDIN, label: ENQUIRY_LEADS.LINKEDIN },
    { value: ENQUIRY_LEADS.YELLOW_PAGE, label: ENQUIRY_LEADS.YELLOW_PAGE },
    { value: ENQUIRY_LEADS.MAIL, label: ENQUIRY_LEADS.MAIL },
    { value: ENQUIRY_LEADS.TAWK_TO, label: ENQUIRY_LEADS.TAWK_TO },
    { value: ENQUIRY_LEADS.META_CAMPAIGNS, label: ENQUIRY_LEADS.META_CAMPAIGNS },
    { value: ENQUIRY_LEADS.GOOGLE_CAMPAIGNS, label: ENQUIRY_LEADS.GOOGLE_CAMPAIGNS }
  ]},
  { category: 'Offline - Referral', options: [
    { value: ENQUIRY_LEADS.OLD_CLIENTS, label: ENQUIRY_LEADS.OLD_CLIENTS },
    { value: ENQUIRY_LEADS.EXISTING_CLIENTS, label: ENQUIRY_LEADS.EXISTING_CLIENTS }
  ]},
  { category: 'Offline - Professional', options: [
    { value: ENQUIRY_LEADS.DOCTOR, label: ENQUIRY_LEADS.DOCTOR },
    { value: ENQUIRY_LEADS.MEDICAL, label: ENQUIRY_LEADS.MEDICAL },
    { value: ENQUIRY_LEADS.NURSE, label: ENQUIRY_LEADS.NURSE }
  ]},
  { category: 'Offline - Unprofessional', options: [
    { value: ENQUIRY_LEADS.COMPOUNDER, label: ENQUIRY_LEADS.COMPOUNDER },
    { value: ENQUIRY_LEADS.ELECTRICIAN, label: ENQUIRY_LEADS.ELECTRICIAN },
    { value: ENQUIRY_LEADS.PLUMBER, label: ENQUIRY_LEADS.PLUMBER }
  ]},
  { category: 'Offline - Events & Stalls', options: [
    { value: ENQUIRY_LEADS.CAMP, label: ENQUIRY_LEADS.CAMP },
    { value: ENQUIRY_LEADS.STALL, label: ENQUIRY_LEADS.STALL },
    { value: ENQUIRY_LEADS.EVENT, label: ENQUIRY_LEADS.EVENT }
  ]},
  { category: 'Offline - Business Partners', options: [
    { value: ENQUIRY_LEADS.BUSINESS_PARTNERS, label: ENQUIRY_LEADS.BUSINESS_PARTNERS }
  ]}
];

// Default Enquiry Object Template
export const DEFAULT_ENQUIRY = {
  clientId: null,
  elderName: '',
  familyName: '',
  phone: '',
  email: '',
  careType: '',
  stage: ENQUIRY_STAGES.NEW,
  lead: ENQUIRY_LEADS.WEBSITE,
  timeline: []
};
