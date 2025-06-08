import { BookingStatus } from '../models/booking.model';

export interface BookingRequest {
  id: number;
  guestName: string;
  hotelName: string;
  roomName: string;
  arrivalDate: Date;
  departureDate: Date;
  numberOfGuests: number;
  requestDate: Date;
  status: BookingStatus;
}