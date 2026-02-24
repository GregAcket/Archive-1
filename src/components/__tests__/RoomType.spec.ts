import {describe, expect, it} from "vitest";
import {RoomType} from "@/components/RoomType.ts";

describe('RoomType tests', () => {
    it('should return correct price label for STANDARD room', () => {
        expect(RoomType.STANDARD.priceLabel()).toBe('Standard  -  80 €/nuit');
    });

    it('should return correct price label for DELUXE room', () => {
        expect(RoomType.DELUXE.priceLabel()).toBe('Deluxe  -  120 €/nuit');
    });
});
