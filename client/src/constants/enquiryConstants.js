// Enquiry Stage Constants
export const ENQUIRY_STAGES = {
  NEW: 'New Enquiry',
  CONTACT: 'Contact',
  PITCHING: 'Pitching',
  ENROLLED: 'Enrolled'
};

// Enquiry Source Constants
export const ENQUIRY_SOURCES = {
  TAWK: 'Tawk.to',
  WEBSITE: 'Website',
  TELECALLER: 'Telecaller',
  REFERRAL: 'Referral'
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

export const SOURCE_OPTIONS = [
  { value: null, label: 'All Sources' },
  { value: ENQUIRY_SOURCES.TAWK, label: ENQUIRY_SOURCES.TAWK },
  { value: ENQUIRY_SOURCES.WEBSITE, label: ENQUIRY_SOURCES.WEBSITE },
  { value: ENQUIRY_SOURCES.TELECALLER, label: ENQUIRY_SOURCES.TELECALLER },
  { value: ENQUIRY_SOURCES.REFERRAL, label: ENQUIRY_SOURCES.REFERRAL }
];

// Default Enquiry Object Template
export const DEFAULT_ENQUIRY = {
  clienId: null,
  elderName: '',
  familyName: '',
  phone: '',
  email: '',
  careType: '',
  stage: ENQUIRY_STAGES.NEW,
  source: ENQUIRY_SOURCES.WEBSITE,
  timeline: []
};
