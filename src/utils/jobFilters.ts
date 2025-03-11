import { FilterAction, FilterState, FormattedJob } from '@/types/jobs';

import { STATUS_OPTIONS } from '@/constants/jobs';

export const initialFilterState: FilterState = {
  statusFilter: STATUS_OPTIONS.ALL,
  searchTerm: '',
  selectedSkills: [],
  currentPage: 1,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'ADD_SKILL':
      return {
        ...state,
        selectedSkills: [...state.selectedSkills, action.payload],
        currentPage: 1,
      };
    case 'REMOVE_SKILL':
      return {
        ...state,
        selectedSkills: state.selectedSkills.filter((skill) => skill !== action.payload),
        currentPage: 1,
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_FILTERS':
      return { ...initialFilterState, statusFilter: state.statusFilter };
    default:
      return state;
  }
}

export function filterJobs(jobs: FormattedJob[], state: FilterState) {
  const { statusFilter, searchTerm, selectedSkills } = state;

  return jobs.filter((job) => {
    if (statusFilter !== STATUS_OPTIONS.ALL && job.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !job.offerTitle.toLowerCase().includes(searchLower) &&
        !job.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (selectedSkills.length > 0) {
      const jobSkillNames = job.skills.map((s) => s.name.toLowerCase());
      if (
        !selectedSkills.every((skill) =>
          jobSkillNames.some((jobSkill) => jobSkill.includes(skill.toLowerCase())),
        )
      ) {
        return false;
      }
    }

    return true;
  });
}
