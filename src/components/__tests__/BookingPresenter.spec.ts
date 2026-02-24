import {describe, expect, it, beforeEach} from "vitest";
import {BookingPresenter} from "@/components/BookingPresenter.ts";
import {RoomType} from "@/components/RoomType.ts";
import {AvailableRoomBookingRepository} from "@/components/__tests__/AvailableRoomBookingRepository.ts";
import {NotAvailableRoomBookingRepository} from "@/components/__tests__/NotAvailableRoomBookingRepository.ts";

describe('BookingPresenter tests', () => {
    let presenter: BookingPresenter;
    describe('Available room tests', () => {
        beforeEach(() => presenter = new BookingPresenter(new AvailableRoomBookingRepository()));

        it('should calculate the number of nights', () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-23';
            expect(presenter.calculateNumberOfNights()).toBe(10);
        });

        it('should calculate total price when user books less than 7 nights', () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-15';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            expect(presenter.calculateTotalPrice()).toBe(240);
        })

        it('should apply promo code discount', () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-15';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            presenter.viewModel.promoCode = 'SUMMER10';
            expect(presenter.calculateTotalPrice()).toBe(216);
        })

        it('should apply discount and promo code when user books more than 7 nights', () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-23';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            presenter.viewModel.promoCode = 'SUMMER10';
            expect(presenter.calculateTotalPrice()).toBe(1026);
        })

        it('should apply discount when user books at leats 7 nights',  () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-23';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            expect(presenter.calculateTotalPrice()).toBe(1140);
        })

        it('should display error message on invalid dates', async () => {
            presenter.viewModel.startDate = '2026-02-23';
            presenter.viewModel.endDate = '2026-02-13';
            await presenter.bookRoom();
            expect(presenter.viewModel.displayErrorMessage ).toBe(true);
            expect(presenter.viewModel.message ).toBe('Dates invalides');
        });

        it('should book room', async () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-23';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            await presenter.bookRoom();
            expect(presenter.viewModel.displaySuccessMessage ).toBe(true);
            expect(presenter.viewModel.message ).toBe(`Réservation confirmée ! Total :  ${presenter.calculateTotalPrice() } €`);
        });
    })

    describe('Unavailable room tests', () => {
        beforeEach(() => presenter = new BookingPresenter(new NotAvailableRoomBookingRepository()));

        it('should not book room when unavailable', async () => {
            presenter.viewModel.startDate = '2026-02-13';
            presenter.viewModel.endDate = '2026-02-23';
            presenter.viewModel.selectedRoomId = RoomType.DELUXE.id;
            await presenter.bookRoom();
            expect(presenter.viewModel.displayErrorMessage ).toBe(true);
            expect(presenter.viewModel.message ).toBe(`Chambre indisponible`);
        });
    })

});