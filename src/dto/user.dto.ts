export interface CreateUserDTO {
  email: string;
  firstname: string;
  lastname: string;
  profilePictureId?: string | null;
}

export interface UpdateUserDTO {
  email?: string;
  firstname?: string;
  lastname?: string;
  profilePictureId?: string | null;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  profilePictureId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserByIdResponseDTO {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  profilePictureId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    userId: string;
    schoolId: string;
    primaryRecommendationId?: string | null;
    status: string;
    skills: string;
    apprenticeshipRythm?: string | null;
    description: string;
    curriculumVitaeId?: string | null;
    previousCompanies: string;
    availability: boolean;
    school: {
      id: string;
      name: string;
      domainId: string;
      logoId?: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt?: Date | null;
    };
    curriculumVitae: {
      uuid: string;
      fileUrl: string;
    } | null;
    jobRequests: Array<{
      id: string;
      studentId: string;
      jobId: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      job: {
        id: string;
        name: string;
        description: string;
        skills?: string | null;
        createdAt: Date;
        updatedAt: Date;
        company: {
          id: string;
          name: string;
          logo: {
            uuid: string;
            fileUrl: string;
          } | null;
        };
        featuredImage: {
          uuid: string;
          fileUrl: string;
        } | null;
      };
    }>;
    recommendations: Array<{
      id: string;
      studentId: string;
      recommenderId: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  } | null;
  schoolOwner?: {
    id: string;
    userId: string;
    schoolId: string;
    school: {
      id: string;
      name: string;
      domain: {
        id: string;
        domain: string;
      };
      logo: {
        uuid: string;
        fileUrl: string;
      } | null;
    };
  } | null;
  companyOwner?: {
    id: string;
    userId: string;
    companyId: string;
    company: {
      id: string;
      name: string;
      logo: {
        uuid: string;
        fileUrl: string;
      } | null;
      jobs: Array<{
        id: string;
        name: string;
        description: string;
        skills?: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    };
  } | null;
  admin?: {
    id: string;
    userId: string;
  } | null;
  profilePicture: {
    uuid: string;
    fileUrl: string;
  } | null;
}
