import { GuestHouse } from './guesthouse.model';
import { Bed } from './bed.model';

export interface Room {
    id: number;
    guestHouse: GuestHouse;
    roomNumber: string;
    amenities?: string;
    description?: string;
    imageUrl?: string;
    beds?: Bed[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    lastModifiedBy?: string;
    availableBeds?: number;
} 