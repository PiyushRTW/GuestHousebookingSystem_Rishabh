
export interface Booking {
  id: string; 
  bookingDate: Date;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomNumber: string;
  bedType: 'single' | 'double' | 'suite';
  checkInDate: Date;
  checkOutDate: Date;
  pricePerNight: number;
  numberOfNights: number;
  totalCost: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'; 
  approvedBy?: string; 
  approvalDate?: Date; 
}