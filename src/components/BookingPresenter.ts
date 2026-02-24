import {BookingViewModel} from "@/components/BookingViewModel.ts";
import {RoomType} from "@/components/RoomType.ts";
import {BookingRepository} from "@/api/BookingRepository.ts";
import {BookingRequest} from "@/components/BookingRequest.ts";

export class BookingPresenter {
    viewModel: BookingViewModel;

    constructor(private readonly _bookingRepository: BookingRepository ) {
        this.viewModel = new BookingViewModel("", "");
    }

    calculateNumberOfNights(): number {
        const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
        const start = new Date(this.viewModel.startDate);
        const end = new Date(this.viewModel.endDate);
        const diffTime = end.getTime() - start.getTime();
        return Math.ceil(diffTime / MILLISECONDS_PER_DAY);
    }

    calculateTotalPrice(): number {
        const nights = this.calculateNumberOfNights()
        let total = nights * RoomType.findById(this.viewModel.selectedRoomId).price
        if (this.viewModel.promoCode === 'SUMMER10') total *= 0.9;
        if (nights >= 7) total *= 0.95;
        return Math.round(total)
    }

    async bookRoom(): Promise<void> {

        this.viewModel.loading = true;
        if (this.calculateNumberOfNights() < 1) {
            this.viewModel.displayErrorMessage = true;
            this.viewModel.displaySuccessMessage = false;
            this.viewModel.message = 'Dates invalides';
            this.endLoading();
            return;
        }
        let isRoomAvailable = await this._bookingRepository.checkAvailability(this.viewModel.selectedRoomId.toString(), this.viewModel.startDate, this.viewModel.endDate);
        if(!isRoomAvailable){
            this.displayErrorMessage();
            this.viewModel.message = `Chambre indisponible`;
            this.endLoading();
            return;
        }

        const bookingData: BookingRequest = {
            roomId: this.viewModel.selectedRoomId.toString(),
            startDate: this.viewModel.startDate,
            endDate: this.viewModel.endDate,
            total: this.calculateTotalPrice()
        }

        await this._bookingRepository.createBooking(bookingData)
        this.viewModel.displaySuccessMessage = true;
        this.viewModel.displayErrorMessage = false;
        this.viewModel.message = `Réservation confirmée ! Total :  ${this.calculateTotalPrice()} €`;
        this.endLoading();

    }

    private displayErrorMessage() {
        this.viewModel.displayErrorMessage = true;
        this.viewModel.displaySuccessMessage = false;
    }

    private endLoading() {
        this.viewModel.loading = false;
    }
}