export interface BookingRequest {
  id: number;
  userId: number;
  bedId: number;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'DENIED' | 'COMPLETED';
  totalPrice: number;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields from relationships (these should be included in the DTO)
  guestName?: string; // from User entity
  hotelName?: string; // from GuestHouse entity through Room and Bed
  roomNumber?: string; // from Room entity through Bed
  bedNumber?: string; // from Bed entity
}