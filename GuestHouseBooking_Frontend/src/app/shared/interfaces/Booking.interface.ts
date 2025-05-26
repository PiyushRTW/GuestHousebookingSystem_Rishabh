// src/app/admin/reservations/booking.model.ts (or a shared models folder)
export interface Booking {
  id: string; // Unique booking ID, perhaps a UUID or timestamp-based
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
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'; // Booking status
  approvedBy?: string; // Admin who approved it (optional for now)
  approvalDate?: Date; // Date of approval (optional for now)
}