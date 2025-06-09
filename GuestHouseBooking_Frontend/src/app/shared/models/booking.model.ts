import { Bed } from './bed.model';
import { User } from './user.model';
import { Room } from './room.model';
import { GuestHouse } from './guesthouse.model';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DENIED = 'DENIED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED'
}

export interface Booking {
    id: number;
    userId: number;
    guestHouseId: number;
    roomId: number;
    bedId: number;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    numberOfNights: number;
    status: BookingStatus;
    purpose?: string;
    
    user?: User;
    guestHouse?: GuestHouse;
    room?: Room;
    bed?: Bed;

    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
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