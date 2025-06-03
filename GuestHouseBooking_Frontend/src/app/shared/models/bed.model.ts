export interface Bed {
    id?: number;
    roomId: number;
    bedNumber: string;
    isAvailable: boolean;
    pricePerNight: number;
    createdAt?: Date;
    updatedAt?: Date;
} 