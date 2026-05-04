import { FormEvent, useEffect, useState } from "react";
import { BookingFormData } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  cabanaId: string;
  isSubmitting: boolean;
  submitErrorMessage: string;
  onCancel: () => void;
  onSubmit: (formData: BookingFormData) => Promise<void> | void;
}

function sanitizeInput(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function BookingModal({
  isOpen,
  cabanaId,
  isSubmitting,
  submitErrorMessage,
  onCancel,
  onSubmit,
}: BookingModalProps): JSX.Element | null {
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRoomNumber("");
      setGuestName("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedRoom = sanitizeInput(roomNumber);
    const normalizedGuestName = sanitizeInput(guestName);

    if (!normalizedRoom || !normalizedGuestName) {
      setErrorMessage("Room number and guest name are required.");
      return;
    }

    if (normalizedRoom.length > 20) {
      setErrorMessage("Room number is too long.");
      return;
    }

    if (normalizedGuestName.length > 100) {
      setErrorMessage("Guest name is too long.");
      return;
    }

    setErrorMessage("");

    try {
      await onSubmit({
        roomNumber: normalizedRoom,
        guestName: normalizedGuestName,
      });
    } catch {
      setErrorMessage("Failed to submit booking. Please try again.");
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Book ${cabanaId}`}
        onClick={(event: any) => event.stopPropagation()}
      >
        <h2>Book Cabana</h2>
        <p className="modal-subtitle">{cabanaId}</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <label htmlFor="roomNumber">Room number</label>
          <input
            id="roomNumber"
            name="roomNumber"
            value={roomNumber}
            onChange={(event: any) =>
              setRoomNumber(String(event.target.value ?? ""))
            }
            autoComplete="off"
            maxLength={20}
            disabled={isSubmitting}
          />

          <label htmlFor="guestName">Guest name</label>
          <input
            id="guestName"
            name="guestName"
            value={guestName}
            onChange={(event: any) =>
              setGuestName(String(event.target.value ?? ""))
            }
            autoComplete="name"
            maxLength={100}
            disabled={isSubmitting}
          />

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {submitErrorMessage ? (
            <p className="form-error">{submitErrorMessage}</p>
          ) : null}

          <div className="modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
