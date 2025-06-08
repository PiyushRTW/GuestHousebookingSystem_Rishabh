export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
} 