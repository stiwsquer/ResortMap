import { BookingService } from "../domain/bookingService";
import { createCabanaId, ResortMap } from "../domain/mapModel";

export const primaryCabanaId = createCabanaId(0, 0);
export const secondaryCabanaId = createCabanaId(1, 1);

export function createTestResortMap(): ResortMap {
  return {
    rows: 2,
    cols: 2,
    cells: [
      { row: 0, col: 0, symbol: "W", type: "cabana", cabanaId: primaryCabanaId },
      { row: 0, col: 1, symbol: "#", type: "path" },
      { row: 1, col: 0, symbol: "p", type: "pool" },
      { row: 1, col: 1, symbol: "W", type: "cabana", cabanaId: secondaryCabanaId },
    ],
    cabanaIds: [primaryCabanaId, secondaryCabanaId],
  };
}

export function createGuestLookupByRoom(): Map<string, string> {
  return new Map([
    ["101", "jane doe"],
    ["202", "john smith"],
  ]);
}

export function createBookingService(): BookingService {
  return new BookingService({
    cabanaIds: [primaryCabanaId, secondaryCabanaId],
    guestLookupByRoom: createGuestLookupByRoom(),
  });
}
