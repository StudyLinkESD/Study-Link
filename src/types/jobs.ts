export type FormattedJob = {
  id: string;
  companyId: string;
  offerTitle: string;
  companyName: string;
  description: string;
  logoUrl: string;
  status: string;
  skills: { id: string; name: string }[];
  availability?: string;
};

export type FilterState = {
  statusFilter: string;
  searchTerm: string;
  selectedSkills: string[];
  currentPage: number;
};

export type FilterAction =
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };
