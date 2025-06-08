import { Room } from './room.model';

export interface Bed {
    id: number;
    room: Room;
    bedNumber: string;
    isAvailable: boolean;
    isAvailableForBooking: boolean;
    pricePerNight: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    lastModifiedBy?: string;
} 