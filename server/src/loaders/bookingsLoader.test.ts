import { describe, expect, it } from "vitest";
import { BookingsLoadError, parseBookingsJson } from "./bookingsLoader";

describe("parseBookingsJson", () => {
  it("parses valid bookings and builds normalized lookup", () => {
    const registry = parseBookingsJson(
      JSON.stringify([
        { room: " 101 ", guestName: " Jane   Doe " },
        { room: "202", guestName: "JOHN SMITH" },
      ]),
    );

    expect(registry.entries).toEqual([
      { room: "101", guestName: "Jane Doe" },
      { room: "202", guestName: "JOHN SMITH" },
    ]);
    expect(registry.lookupByRoom.get("101")).toBe("jane doe");
    expect(registry.lookupByRoom.get("202")).toBe("john smith");
  });

  it("throws when json is invalid", () => {
    expect(() => parseBookingsJson("{bad json")).toThrowError(BookingsLoadError);
  });

  it("throws when root is not array", () => {
    expect(() => parseBookingsJson(JSON.stringify({ room: "101" }))).toThrowError(
      BookingsLoadError,
    );
  });

  it("throws when entry fields are empty", () => {
    expect(() =>
      parseBookingsJson(JSON.stringify([{ room: " ", guestName: " " }])),
    ).toThrowError(BookingsLoadError);
  });

  it("throws when same room maps to different guests", () => {
    expect(() =>
      parseBookingsJson(
        JSON.stringify([
          { room: "101", guestName: "Jane Doe" },
          { room: "101", guestName: "John Smith" },
        ]),
      ),
    ).toThrowError(BookingsLoadError);
  });
});
