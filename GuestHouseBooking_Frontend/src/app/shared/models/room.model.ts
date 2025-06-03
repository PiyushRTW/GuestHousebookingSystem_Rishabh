export interface Room {
    id?: number;
    guestHouseId: number;
    roomNumber: string;
    description: string;
    amenities: string;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
} 