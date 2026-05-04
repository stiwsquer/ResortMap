import { BookingDomainError, BookingErrorCode } from '../domain/bookingService';

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

function statusFromBookingCode(code: BookingErrorCode): number {
  if (code === 'CABANA_NOT_FOUND') {
    return 404;
  }

  if (code === 'CABANA_ALREADY_BOOKED') {
    return 409;
  }

  return 422;
}

export function notFoundHandler(_req: any, res: any): void {
  res.status(404).json({ message: 'Resource not found.' });
}

export function errorHandler(error: unknown, _req: any, res: any, _next: any): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof BookingDomainError) {
    res.status(statusFromBookingCode(error.code)).json({ message: error.message });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }

  res.status(500).json({ message: 'Unexpected server error.' });
}
