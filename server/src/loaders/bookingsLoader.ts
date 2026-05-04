import { readFile } from 'node:fs/promises';
import { normalizeGuestName, normalizeRoomNumber } from '../domain/normalization';

export interface GuestBookingEntry {
  room: string;
  guestName: string;
}

export interface GuestRegistry {
  entries: GuestBookingEntry[];
  lookupByRoom: Map<string, string>;
}

export class BookingsLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingsLoadError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseBookingsJson(raw: string): GuestRegistry {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BookingsLoadError('Invalid bookings JSON: failed to parse file.');
  }

  if (!Array.isArray(parsed)) {
    throw new BookingsLoadError('Invalid bookings format: root value must be an array.');
  }

  const entries: GuestBookingEntry[] = [];
  const lookupByRoom = new Map<string, string>();

  parsed.forEach((item, index) => {
    if (!isObject(item)) {
      throw new BookingsLoadError(
        `Invalid bookings format at index ${index}: expected an object.`
      );
    }

    const room = item.room;
    const guestName = item.guestName;

    if (typeof room !== 'string' || typeof guestName !== 'string') {
      throw new BookingsLoadError(
        `Invalid bookings entry at index ${index}: room and guestName must both be strings.`
      );
    }

    const normalizedRoom = normalizeRoomNumber(room);
    const normalizedGuest = normalizeGuestName(guestName);

    if (!normalizedRoom || !normalizedGuest) {
      throw new BookingsLoadError(
        `Invalid bookings entry at index ${index}: room and guestName cannot be empty.`
      );
    }

    const existingGuest = lookupByRoom.get(normalizedRoom);

    if (existingGuest && existingGuest !== normalizedGuest) {
      throw new BookingsLoadError(
        `Invalid bookings format: duplicate room ${normalizedRoom} maps to multiple guest names.`
      );
    }

    entries.push({ room: normalizedRoom, guestName: guestName.trim().replace(/\s+/g, ' ') });
    lookupByRoom.set(normalizedRoom, normalizedGuest);
  });

  return { entries, lookupByRoom };
}

export async function loadBookingsFromFile(filePath: string): Promise<GuestRegistry> {
  let raw: string;

  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown file read error.';
    throw new BookingsLoadError(`Failed to read bookings file (${filePath}): ${message}`);
  }

  return parseBookingsJson(raw);
}
