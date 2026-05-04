export function normalizeRoomNumber(roomNumber: string): string {
  return roomNumber.trim();
}

export function normalizeGuestName(guestName: string): string {
  return guestName.trim().replace(/\s+/g, ' ').toLowerCase();
}
