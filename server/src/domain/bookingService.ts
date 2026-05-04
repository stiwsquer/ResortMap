import { normalizeGuestName, normalizeRoomNumber } from './normalization';

export type BookingErrorCode =
  | 'CABANA_NOT_FOUND'
  | 'CABANA_ALREADY_BOOKED'
  | 'INVALID_GUEST'
  | 'INVALID_INPUT';

export class BookingDomainError extends Error {
  public readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode, message: string) {
    super(message);
    this.name = 'BookingDomainError';
    this.code = code;
  }
}

export interface BookingRecord {
  cabanaId: string;
  roomNumber: string;
  guestName: string;
  bookedAt: string;
}

export interface BookingServiceOptions {
  cabanaIds: string[];
  guestLookupByRoom: Map<string, string>;
}

export class BookingService {
  private readonly cabanaIds = new Set<string>();
  private readonly guestLookupByRoom: Map<string, string>;
  private readonly bookingsByCabanaId = new Map<string, BookingRecord>();

  constructor(options: BookingServiceOptions) {
    for (const cabanaId of options.cabanaIds) {
      this.cabanaIds.add(cabanaId);
    }

    this.guestLookupByRoom = options.guestLookupByRoom;
  }

  isAvailable(cabanaId: string): boolean {
    this.assertCabanaExists(cabanaId);
    return !this.bookingsByCabanaId.has(cabanaId);
  }

  getBooking(cabanaId: string): BookingRecord | null {
    this.assertCabanaExists(cabanaId);
    return this.bookingsByCabanaId.get(cabanaId) ?? null;
  }

  validateGuest(roomNumber: string, guestName: string): boolean {
    const normalizedRoom = normalizeRoomNumber(roomNumber);
    const normalizedGuest = normalizeGuestName(guestName);

    if (!normalizedRoom || !normalizedGuest) {
      return false;
    }

    return this.guestLookupByRoom.get(normalizedRoom) === normalizedGuest;
  }

  bookCabana(cabanaId: string, roomNumber: string, guestName: string): BookingRecord {
    this.assertCabanaExists(cabanaId);

    const normalizedRoom = normalizeRoomNumber(roomNumber);
    const normalizedGuest = normalizeGuestName(guestName);

    if (!normalizedRoom || !normalizedGuest) {
      throw new BookingDomainError(
        'INVALID_INPUT',
        'Room number and guest name are required.'
      );
    }

    if (!this.validateGuest(normalizedRoom, normalizedGuest)) {
      throw new BookingDomainError(
        'INVALID_GUEST',
        'Room number and guest name do not match current guests.'
      );
    }

    if (this.bookingsByCabanaId.has(cabanaId)) {
      throw new BookingDomainError('CABANA_ALREADY_BOOKED', 'Cabana is already booked.');
    }

    const booking: BookingRecord = {
      cabanaId,
      roomNumber: normalizedRoom,
      guestName: guestName.trim().replace(/\s+/g, ' '),
      bookedAt: new Date().toISOString(),
    };

    this.bookingsByCabanaId.set(cabanaId, booking);

    return booking;
  }

  getAvailabilityByCabanaId(): Map<string, boolean> {
    const result = new Map<string, boolean>();

    for (const cabanaId of this.cabanaIds) {
      result.set(cabanaId, !this.bookingsByCabanaId.has(cabanaId));
    }

    return result;
  }

  private assertCabanaExists(cabanaId: string): void {
    if (!this.cabanaIds.has(cabanaId)) {
      throw new BookingDomainError('CABANA_NOT_FOUND', `Unknown cabana id: ${cabanaId}`);
    }
  }
}
