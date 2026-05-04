import express from "express";
import { BookingService } from "../domain/bookingService";
import { HttpError } from "../middleware/errorHandler";

interface BookingPayload {
  roomNumber: string;
  guestName: string;
}

function parseBookingPayload(body: unknown): BookingPayload {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(422, "Booking request must be a JSON object.");
  }

  const bodyRecord = body as Record<string, unknown>;
  const roomNumber = bodyRecord.roomNumber;
  const guestName = bodyRecord.guestName;

  if (typeof roomNumber !== "string" || typeof guestName !== "string") {
    throw new HttpError(422, "roomNumber and guestName must both be strings.");
  }

  return { roomNumber, guestName };
}

export function createCabanaRouter(bookingService: BookingService): any {
  const router = express.Router();

  router.post("/cabanas/:id/book", (req: any, res: any, next: any) => {
    try {
      const cabanaId = String(req.params.id ?? "");
      const payload = parseBookingPayload(req.body);
      const booking = bookingService.bookCabana(
        cabanaId,
        payload.roomNumber,
        payload.guestName,
      );

      res.status(200).json({
        message: "Cabana booked successfully.",
        booking,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
