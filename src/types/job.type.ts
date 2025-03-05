import { Timestamps } from './timestamps.type';

interface IJob extends Timestamps {
  id: string;
  company_id: string;
  name: string;
  description: string;
  featured_image: string;
}

export type { IJob };
