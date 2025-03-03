export type Job = {
  id: string
  companyId: string
  title: string
  description: string
  status: 'open' | 'closed'
  type: 'alternance' | 'stage'
  location: string
  skills: string[]
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}
