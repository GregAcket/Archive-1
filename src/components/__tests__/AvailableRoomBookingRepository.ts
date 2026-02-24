import {BookingRepository} from "@/api/BookingRepository.ts";
import {BookingRequest} from "@/components/BookingRequest.ts";
import {BookingResponse} from "@/components/BookingResponse.ts";

export class AvailableRoomBookingRepository implements BookingRepository {
    checkAvailability(roomId: string, startDate: string, endDate: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    createBooking(data: BookingRequest): Promise<BookingResponse> {
        return Promise.resolve(undefined);
    }
}