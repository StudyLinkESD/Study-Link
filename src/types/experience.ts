export type SimpleExperience = {
  id: string;
  company: string;
  position: string;
  period: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
  startDate?: Date;
  endDate?: Date;
};
