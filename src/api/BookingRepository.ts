import {BookingRequest} from "@/components/BookingRequest.ts";
import {BookingResponse} from "@/components/BookingResponse.ts";

export interface BookingRepository {
    checkAvailability(
        roomId: string,
        startDate: string,
        endDate: string
    ): Promise<boolean>;

    createBooking(
        data: BookingRequest
    ): Promise<BookingResponse>
}