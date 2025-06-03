export interface Booking {
    id?: number;
    userId: number;
    bedId: number;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
} 