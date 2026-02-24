import {describe, expect, it, vi} from "vitest";
import BookingComponent from "@/components/BookingComponent.vue";
import {mount} from "@vue/test-utils";
import * as bookingApi from "@/api/bookingApi";
import {beforeEach} from "node:test";

vi.mock('@/api/bookingApi', () => ({
    checkAvailability: vi.fn(),
    createBooking: vi.fn()
}));
describe('Booking component tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })
    it('should show success message on booking ok', async () => {
        (bookingApi.checkAvailability as any).mockResolvedValue(true);
        (bookingApi.createBooking as any).mockResolvedValue({status: 'OK'});
        const wrapper = mount(BookingComponent);
        wrapper.find('select').setValue('1');
        wrapper.findAll('input')[0].setValue('2026-02-13');
        wrapper.findAll('input')[1].setValue('2026-02-17');
        wrapper.find('button').trigger('click');
        await new Promise(process.nextTick);
        expect(wrapper.text()).toContain('Réservation confirmée');
        expect(wrapper.find('.success').exists()).toBe(true);
    });
});