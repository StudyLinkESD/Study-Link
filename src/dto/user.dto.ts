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
