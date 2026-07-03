export const STATUS_LABELS: Record<string, string> = {
  'new': 'Inquiry Received',
  'contacted': 'Contacted',
  'interested': 'Evaluation',
  'not-interested': 'Closed',
  'enrolled-college': 'Enrolled',
  'enrolled-institute': 'Directly Enrolled',
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  'new': "We've received your request! An advisor will review your options shortly.",
  'contacted': 'Our team has contacted you. We are ready to help you select a program.',
  'interested': 'Your profile is updated. We are finalizing details for your target universities.',
  'not-interested': 'Inquiry closed. Let us know if you decide to explore other courses.',
  'enrolled-college': 'Congratulations! You are enrolled in a partner university.',
  'enrolled-institute': 'Congratulations! You are enrolled directly in our degree program.',
};

export const CATEGORIES = [
  { abbr: 'BCA', name: 'Computer Applications', icon: 'MonitorPlay' },
  { abbr: 'BBA', name: 'Business Administration', icon: 'Briefcase' },
  { abbr: 'MBA', name: 'Business Mgmt (Masters)', icon: 'Award' },
  { abbr: 'BSc', name: 'Science & Technology', icon: 'Atom' },
  { abbr: 'MSc', name: 'Advanced Science', icon: 'Atom' },
  { abbr: 'BCom', name: 'Commerce & Finance', icon: 'Calculator' },
];

export const LEAD_STATUSES = ['new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute'] as const;
export const INSTITUTE_LEAD_STATUSES = ['new', 'contacted', 'interested', 'not-interested', 'converted'] as const;
export const PARTNER_INQUIRY_STATUSES = ['new', 'contacted', 'interested', 'not-interested', 'converted'] as const;
export const CALL_OUTCOMES = ['interested', 'not-interested', 'call-back-later', 'no-answer'] as const;

export const NAV_ITEMS = [
  { id: 'universities', label: 'Universities', href: '/colleges' },
  { id: 'courses', label: 'Courses', href: '#' },
  { id: 'programs', label: 'Programs', href: '#' },
  { id: 'get-help', label: 'Get Help', href: '#' },
] as const;
