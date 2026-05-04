import { describe, expect, it } from "vitest";
import { BookingDomainError } from "./bookingService";
import {
  createBookingService,
  primaryCabanaId,
  secondaryCabanaId,
} from "../test/fixtures";

describe("BookingService", () => {
  it("validates guest using normalized room and guest name", () => {
    const service = createBookingService();

    expect(service.validateGuest(" 101 ", "  JANE   DOE ")).toBe(true);
    expect(service.validateGuest("101", "Wrong Name")).toBe(false);
  });

  it("books an available cabana and stores normalized booking data", () => {
    const service = createBookingService();

    const booking = service.bookCabana(
      primaryCabanaId,
      " 101 ",
      "  Jane   Doe ",
    );

    expect(booking).toMatchObject({
      cabanaId: primaryCabanaId,
      roomNumber: "101",
      guestName: "Jane Doe",
    });
    expect(new Date(booking.bookedAt).toString()).not.toBe("Invalid Date");
    expect(service.isAvailable(primaryCabanaId)).toBe(false);
    expect(service.getBooking(primaryCabanaId)).toEqual(booking);
  });

  it("throws INVALID_INPUT when required values are empty", () => {
    const service = createBookingService();

    expect(() => service.bookCabana(primaryCabanaId, " ", " ")).toThrowError(
      BookingDomainError,
    );

    try {
      service.bookCabana(primaryCabanaId, " ", " ");
    } catch (error) {
      expect(error).toBeInstanceOf(BookingDomainError);
      const domainError = error as BookingDomainError;
      expect(domainError.code).toBe("INVALID_INPUT");
    }
  });

  it("throws INVALID_INPUT when room number is too long", () => {
    const service = createBookingService();

    expect(() =>
      service.bookCabana(primaryCabanaId, "1".repeat(21), "Jane Doe"),
    ).toThrowError(BookingDomainError);

    try {
      service.bookCabana(primaryCabanaId, "1".repeat(21), "Jane Doe");
    } catch (error) {
      expect(error).toBeInstanceOf(BookingDomainError);
      const domainError = error as BookingDomainError;
      expect(domainError.code).toBe("INVALID_INPUT");
      expect(domainError.message).toBe("Room number is too long.");
    }
  });

  it("throws INVALID_INPUT when guest name is too long", () => {
    const service = createBookingService();

    expect(() =>
      service.bookCabana(primaryCabanaId, "101", "A".repeat(101)),
    ).toThrowError(BookingDomainError);

    try {
      service.bookCabana(primaryCabanaId, "101", "A".repeat(101));
    } catch (error) {
      expect(error).toBeInstanceOf(BookingDomainError);
      const domainError = error as BookingDomainError;
      expect(domainError.code).toBe("INVALID_INPUT");
      expect(domainError.message).toBe("Guest name is too long.");
    }
  });

  it("throws INVALID_GUEST when room and guest do not match", () => {
    const service = createBookingService();

    expect(() =>
      service.bookCabana(primaryCabanaId, "101", "John Smith"),
    ).toThrowError(BookingDomainError);

    try {
      service.bookCabana(primaryCabanaId, "101", "John Smith");
    } catch (error) {
      expect((error as BookingDomainError).code).toBe("INVALID_GUEST");
    }
  });

  it("throws CABANA_ALREADY_BOOKED when booking same cabana twice", () => {
    const service = createBookingService();

    service.bookCabana(primaryCabanaId, "101", "Jane Doe");

    expect(() =>
      service.bookCabana(primaryCabanaId, "101", "Jane Doe"),
    ).toThrowError(BookingDomainError);

    try {
      service.bookCabana(primaryCabanaId, "101", "Jane Doe");
    } catch (error) {
      expect((error as BookingDomainError).code).toBe("CABANA_ALREADY_BOOKED");
    }
  });

  it("throws CABANA_NOT_FOUND for unknown cabana ids", () => {
    const service = createBookingService();

    expect(() => service.isAvailable("unknown-cabana")).toThrowError(
      BookingDomainError,
    );

    try {
      service.getBooking("unknown-cabana");
    } catch (error) {
      expect((error as BookingDomainError).code).toBe("CABANA_NOT_FOUND");
    }
  });

  it("returns availability map for all known cabanas", () => {
    const service = createBookingService();

    service.bookCabana(primaryCabanaId, "101", "Jane Doe");

    const availabilityByCabana = service.getAvailabilityByCabanaId();

    expect(availabilityByCabana.get(primaryCabanaId)).toBe(false);
    expect(availabilityByCabana.get(secondaryCabanaId)).toBe(true);
  });
});
