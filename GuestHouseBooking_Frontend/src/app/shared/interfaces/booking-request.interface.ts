export interface BookingRequest {
  requestId: string;
  userId: string;
  guestName: string;
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomName: string;
  bedId: number;
  bedName: string;
  arrivalDate: Date;
  departureDate: Date;
  numberOfGuests: number;
  requestDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}