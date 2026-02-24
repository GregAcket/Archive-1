import {RoomType} from "@/components/RoomType.ts";

export class BookingViewModel {
    startDate: string;
    endDate: string;
    selectedRoomId: number = RoomType.STANDARD.id;
    roomTypes: RoomType[] = RoomType.all();
    promoCode: string = '';
    displayErrorMessage: boolean = false;
    message: string = '';
    displaySuccessMessage: boolean = false;
    loading: boolean = false;

    constructor(startDate: string, endDate: string) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
}