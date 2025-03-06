export interface School {
  id: string;
  name: string;
  domainId: string;
  logo: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  domain: {
    id: string;
    domain: string;
  };
}
