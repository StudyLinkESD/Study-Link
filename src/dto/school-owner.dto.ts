export interface CreateSchoolOwnerDTO {
  userId: string;
  schoolId: string;
}

export interface UpdateSchoolOwnerDTO {
  userId?: string;
  schoolId?: string;
}

export interface SchoolOwnerResponseDTO {
  id: string;
  userId: string;
  schoolId: string;
}
