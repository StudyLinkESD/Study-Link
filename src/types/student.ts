export type Student = {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  profileImage?: string
  status: 'alternant' | 'stagiaire'
  skills: string[]
  school: string
  alternanceRhythm?: string
  description?: string
  cvUrl?: string
  availability: boolean
  createdAt: Date
  updatedAt: Date
}
