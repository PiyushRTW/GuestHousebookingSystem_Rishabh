import { Room } from './room.model';

export interface GuestHouse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  amenities?: string;
  contactNumber?: string;
  email?: string;
  imageUrl?: string;
  rooms?: Room[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}