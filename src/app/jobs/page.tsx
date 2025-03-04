import JobsList from '@/components/app/jobs/JobsList';

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
    <main>
      <JobsList jobs={exampleJobs} title="Découvrez nos offres" />
    </main>
  );
}
