import JobsList from '@/components/app/jobs/JobsList';
import JobView from '@/components/app/jobs/JobView';

import { JobProvider } from '@/context/job.context';

const exampleJobs = [
  {
    id: '1',
    offerTitle: 'Développeur Frontend',
    companyName: 'Logitech',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    logoUrl: '',
    status: 'Alternance' as const,
    skills: [
      { id: 'react', name: 'React' },
      { id: 'javascript', name: 'JavaScript' },
    ],
    availability: 'Septembre 2025',
  },
  {
    id: '2',
    offerTitle: 'Développeur Backend',
    companyName: 'ESD',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    logoUrl: '',
    status: 'Stage' as const,
    skills: [
      { id: 'react', name: 'React' },
      { id: 'javascript', name: 'JavaScript' },
    ],
    availability: 'Septembre 2025',
  },
];
export default function JobsPage() {
  return (
    <JobProvider>
      <main className="flex w-full flex-1 flex-row items-start justify-start px-20">
        <JobsList jobs={exampleJobs} title="Découvrez nos offres" />
        <JobView />
      </main>
    </JobProvider>
  );
}
