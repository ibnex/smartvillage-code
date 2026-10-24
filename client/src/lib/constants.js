export const PROJECT_STATUSES = ['Planned', 'Ongoing', 'Completed', 'On Hold'];
export const PROJECT_CATEGORIES = [
  'Infrastructure',
  'Education',
  'Water Supply',
  'Energy',
  'Healthcare',
  'Sanitation',
];
export const COMPLAINT_CATEGORIES = ['Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Other'];
export const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const PROJECT_STATUS_STYLES = {
  Completed: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    color: '#10B981',
  },
  Ongoing: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    color: '#F59E0B',
  },
  Planned: {
    badge: 'border-slate-200 bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
    color: '#94A3B8',
  },
  'On Hold': {
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
    color: '#3B82F6',
  },
};

export const COMPLAINT_STATUS_STYLES = {
  Resolved: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    color: '#10B981',
  },
  'In Progress': {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    color: '#F59E0B',
  },
  Pending: {
    badge: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-500',
    color: '#EF4444',
  },
};

export const CATEGORY_STYLES = {
  Infrastructure: 'border-sky-200 bg-sky-50 text-sky-700',
  Education: 'border-violet-200 bg-violet-50 text-violet-700',
  'Water Supply': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  Energy: 'border-amber-200 bg-amber-50 text-amber-700',
  Healthcare: 'border-rose-200 bg-rose-50 text-rose-700',
  Sanitation: 'border-teal-200 bg-teal-50 text-teal-700',
  Electricity: 'border-amber-200 bg-amber-50 text-amber-700',
  Roads: 'border-slate-200 bg-slate-100 text-slate-700',
  Other: 'border-slate-200 bg-slate-100 text-slate-600',
};

export const SECTOR_CONFIG = [
  { key: 'agriculture', label: 'Agriculture', color: 'bg-emerald-600' },
  { key: 'education', label: 'Education', color: 'bg-emerald-500' },
  { key: 'healthcare', label: 'Healthcare', color: 'bg-emerald-600' },
  { key: 'sanitation', label: 'Sanitation', color: 'bg-emerald-500' },
  { key: 'housing', label: 'Housing', color: 'bg-emerald-600' },
];

export const ACTIVITY_STYLES = {
  complaint_new: { bg: 'bg-blue-50 text-blue-600 ring-blue-100', icon: 'message' },
  complaint_progress: { bg: 'bg-amber-50 text-amber-600 ring-amber-100', icon: 'clock' },
  complaint_resolved: { bg: 'bg-emerald-50 text-emerald-600 ring-emerald-100', icon: 'check' },
  project_added: { bg: 'bg-emerald-50 text-emerald-600 ring-emerald-100', icon: 'folder' },
  project_updated: { bg: 'bg-slate-100 text-slate-600 ring-slate-200', icon: 'refresh' },
  import: { bg: 'bg-blue-50 text-blue-600 ring-blue-100', icon: 'upload' },
  import_failed: { bg: 'bg-red-50 text-red-600 ring-red-100', icon: 'alert' },
};

export const VILLAGE_DEMO_CREDENTIALS = {
  officer: { email: 'officer@smartvillage.gov.in', password: 'Officer@123' },
  citizen: { email: 'citizen@smartvillage.gov.in', password: 'Citizen@123' },
};
