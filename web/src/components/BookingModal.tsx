import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BookingFormData } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  cabanaId: string;
  isSubmitting: boolean;
  submitErrorMessage: string;
  successMessage: string;
  successCountdown: number | null;
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
  successMessage,
  successCountdown,
  onCancel,
  onSubmit,
}: BookingModalProps): JSX.Element | null {
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const closeOnOverlayClickRef = useRef(false);

  const requestClose = useCallback((): void => {
    if (isSubmitting) {
      return;
    }

    onCancel();
  }, [isSubmitting, onCancel]);

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>): void {
    closeOnOverlayClickRef.current = event.target === event.currentTarget;
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>): void {
    const clickedOverlay = event.target === event.currentTarget;

    if (clickedOverlay && closeOnOverlayClickRef.current) {
      requestClose();
    }

    closeOnOverlayClickRef.current = false;
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [requestClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerRef.current = document.activeElement;
    setRoomNumber("");
    setGuestName("");
    setErrorMessage("");

    requestAnimationFrame(() => {
      const firstInput =
        modalRef.current?.querySelector<HTMLElement>("input, button");
      firstInput?.focus();
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
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
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={(event: any) => event.stopPropagation()}
      >
        {successMessage ? (
          <>
            <h2 id="modal-heading">Booking Confirmed</h2>
            <p className="modal-subtitle">{successMessage}</p>
            {typeof successCountdown === "number" && successCountdown > 0 ? (
              <p className="modal-countdown" role="status" aria-live="polite">
                Closing in {successCountdown}s...
              </p>
            ) : null}
            <div className="modal-actions">
              <button
                type="button"
                className="button-primary"
                onClick={requestClose}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="modal-heading">Book Cabana</h2>
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
                required
                aria-required="true"
                aria-describedby={
                  errorMessage || submitErrorMessage
                    ? "booking-error"
                    : undefined
                }
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
                required
                aria-required="true"
                aria-describedby={
                  errorMessage || submitErrorMessage
                    ? "booking-error"
                    : undefined
                }
              />

              {errorMessage ? (
                <p id="booking-error" className="form-error" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              {submitErrorMessage ? (
                <p id="booking-error" className="form-error" role="alert">
                  {submitErrorMessage}
                </p>
              ) : null}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={requestClose}
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
          </>
        )}
      </div>
    </div>
  );
}
