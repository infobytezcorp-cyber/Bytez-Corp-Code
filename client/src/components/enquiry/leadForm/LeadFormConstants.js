// Lead Form Constants & Mappings

export const SRC_MAP = {
  website:   'Website',
  whatsapp:  'Whatsapp',
  facebook:  'Facebook',
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  yellowpage:'Yellow page',
  mail:      'Mail',
  tawkto:    'Tawk.to',
  meta:      'Meta Campaigns',
  google:    'Google Campaigns',
  call:      'Incoming Call',
  reference: 'Old clients',
  hospital:  'Doctor',
  walkin:    'Walk-in',
};

export const SVCS_HOME = [
  {id:"hn12",  label:"Home Nursing 12/7"},
  {id:"hn24",  label:"Home Nursing 24/7"},
  {id:"pca12", label:"Patient Care Attender 12/7"},
  {id:"pca24", label:"Patient Care Attender 24/7"},
  {id:"cook12",label:"Cook 12/7"},
  {id:"cook24",label:"Cook 24/7"},
  {id:"baby",  label:"Baby Sitter 12/7"},
  {id:"maid12",label:"Maid Staff 12/7"},
  {id:"maid24",label:"Maid Staff 24/7"},
];

export const SVCS_HEALTH = [
  {id:"en12",label:"Emergency Nurse 12/7"},
  {id:"en24",label:"Emergency Nurse 24/7"},
  {id:"oah", label:"Old Age Home"},
  {id:"dah", label:"Doctor @ Home"},
  {id:"amb", label:"Ambulance Service"},
  {id:"hsc", label:"Home Sample Collection"},
  {id:"dn24",label:"Diploma Nurse 24/7"},
  {id:"dn12",label:"Diploma Nurse 12/7"},
  {id:"ecs", label:"Elder Care Service 24/7"},
];

export const EMERGENCY_TYPES = ['en12','en24','dah','amb'];
export const HOUSEHOLD_TYPES  = ['cook12','cook24','maid12','maid24'];
export const BABY_TYPES       = ['baby'];

export const SRCS = [
  {id:"website",   label:"Website",           color:"#4285F4"},
  {id:"whatsapp",  label:"WhatsApp",          color:"#25D366"},
  {id:"facebook",  label:"Facebook",          color:"#1877F2"},
  {id:"instagram", label:"Instagram",         color:"#E1306C"},
  {id:"linkedin",  label:"LinkedIn",          color:"#0A66C2"},
  {id:"yellowpage",label:"Yellow Pages",      color:"#FF6600"},
  {id:"mail",      label:"Mail / Email",      color:"#9C27B0"},
  {id:"tawkto",    label:"Tawk.to",           color:"#1D9E75"},
  {id:"meta",      label:"Meta Campaigns",    color:"#0668E1"},
  {id:"google",    label:"Google Campaigns",  color:"#EA4335"},
  {id:"call",      label:"Incoming Call",     color:"#3A9467"},
  {id:"reference", label:"Reference",         color:"#B85E10"},
  {id:"hospital",  label:"Hospital Referral", color:"#C0392B"},
  {id:"walkin",    label:"Walk-in",           color:"#444441"},
];

export const allServices = () => [...SVCS_HOME, ...SVCS_HEALTH];

export const getSvcType = (id) => {
  if (!id) return 'medical';
  if (EMERGENCY_TYPES.includes(id)) return 'emergency';
  if (HOUSEHOLD_TYPES.includes(id)) return 'household';
  if (BABY_TYPES.includes(id)) return 'baby';
  return 'medical';
};

export const getServiceById = (id) => allServices().find(s => s.id === id);
