export interface GuestHouse {
  id?: number;
  name: string;
  address: string;
  description?: string;
  totalRooms: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 