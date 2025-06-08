import { Bed } from './bed.model';
import { User } from './user.model';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DENIED = 'DENIED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED'
}

export interface Booking {
    id?: number;
    userId?: number;
    bedId?: number;
    roomId?: number;
    guestHouseId?: number;
    user?: User;
    bed?: Bed;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    checkInDate: Date;
    checkOutDate: Date;
    status: BookingStatus;
    totalPrice: number;
    purpose?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    lastModifiedBy?: string;

    userName?: string;
    bedNumber?: string;
    roomNumber?: string;
    guestHouseName?: string;

    rejectionReason?: string;
    cancellationReason?: string;
} 