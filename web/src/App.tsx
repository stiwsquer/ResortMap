import { useEffect, useMemo, useState } from "react";
import { bookCabana, fetchMapData } from "./api/client";
import { BookingModal } from "./components/BookingModal";
import { Legend } from "./components/Legend";
import { ResortGrid } from "./components/ResortGrid";
import { BookingFormData, ResortMapCell, ResortMapData } from "./types";
import "./styles/app.css";

const SUCCESS_DIALOG_AUTO_CLOSE_SECONDS = 10;
const UNAVAILABLE_TOAST_MS = 4000;

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function App(): JSX.Element {
  const [mapData, setMapData] = useState<ResortMapData | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapLoadError, setMapLoadError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState("");
  const [selectedCabana, setSelectedCabana] = useState<ResortMapCell | null>(
    null,
  );
  const [unavailableToast, setUnavailableToast] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);

  async function refreshMap(): Promise<ResortMapData> {
    const data = await fetchMapData();
    setMapData(data);
    return data;
  }

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      if (isMounted) {
        setIsLoadingMap(true);
        setMapLoadError("");
      }

      try {
        const data = await fetchMapData();

        if (!isMounted) {
          return;
        }

        setMapData(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMapData(null);
        setMapLoadError(
          toErrorMessage(error, "Failed to load map. Please try again."),
        );
      } finally {
        if (isMounted) {
          setIsLoadingMap(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!unavailableToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setUnavailableToast("");
    }, UNAVAILABLE_TOAST_MS);

    return () => window.clearTimeout(timeout);
  }, [unavailableToast]);

  useEffect(() => {
    if (!successMessage || successCountdown === null) {
      return;
    }

    if (successCountdown <= 0) {
      closeModal();
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessCountdown((seconds) => {
        if (seconds === null) {
          return null;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [successMessage, successCountdown]);

  const availableCount = useMemo(() => {
    if (!mapData) {
      return 0;
    }

    return mapData.cells.filter(
      (cell: ResortMapCell) => cell.type === "cabana" && cell.available,
    ).length;
  }, [mapData]);

  function handleCabanaClick(cell: ResortMapCell): void {
    if (!cell.cabanaId) {
      return;
    }

    setSuccessMessage("");
    setSuccessCountdown(null);
    setUnavailableToast("");

    if (!cell.available) {
      setUnavailableToast(
        "This cabana is currently unavailable. Please choose another one.",
      );
      return;
    }

    setSelectedCabana(cell);
  }

  function closeModal(): void {
    setSelectedCabana(null);
    setBookingSubmitError("");
    setSuccessMessage("");
    setSuccessCountdown(null);
  }

  async function retryMapLoad(): Promise<void> {
    setIsLoadingMap(true);
    setMapLoadError("");

    try {
      const data = await fetchMapData();
      setMapData(data);
    } catch (error) {
      setMapData(null);
      setMapLoadError(
        toErrorMessage(error, "Failed to load map. Please try again."),
      );
    } finally {
      setIsLoadingMap(false);
    }
  }

  async function handleBookingSubmit(formData: BookingFormData): Promise<void> {
    if (!selectedCabana?.cabanaId) {
      return;
    }

    const cabanaId = selectedCabana.cabanaId;

    setIsSubmittingBooking(true);
    setBookingSubmitError("");

    try {
      await bookCabana(cabanaId, formData);
      setSuccessMessage(
        `Booking confirmed for ${formData.guestName} (room ${formData.roomNumber}) at ${cabanaId}.`,
      );
      setSuccessCountdown(SUCCESS_DIALOG_AUTO_CLOSE_SECONDS);

      try {
        await refreshMap();
      } catch (error) {
        setUnavailableToast(
          toErrorMessage(
            error,
            "Booking succeeded, but failed to refresh map. Please reload the page.",
          ),
        );
      }
    } catch (error) {
      const message = toErrorMessage(
        error,
        "Booking failed. Please try again.",
      );

      setBookingSubmitError(message);
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Resort Cabana Map</h1>
        <p className="availability-pill">Available cabanas: {availableCount}</p>
      </header>

      <Legend />

      <div aria-live="polite" aria-atomic="true">
        {isLoadingMap ? (
          <p className="message message-info">Loading map...</p>
        ) : null}
      </div>

      {!isLoadingMap && mapLoadError ? (
        <div className="message message-error" role="alert">
          <p>{mapLoadError}</p>
          <button
            type="button"
            className="button-secondary message-action"
            onClick={() => void retryMapLoad()}
          >
            Retry loading map
          </button>
        </div>
      ) : null}

      {unavailableToast ? (
        <p className="info-toast" role="status" aria-live="polite">
          {unavailableToast}
        </p>
      ) : null}

      {mapData ? (
        <ResortGrid map={mapData} onCabanaClick={handleCabanaClick} />
      ) : null}

      <BookingModal
        isOpen={Boolean(selectedCabana?.cabanaId) || Boolean(successMessage)}
        cabanaId={selectedCabana?.cabanaId ?? ""}
        isSubmitting={isSubmittingBooking}
        submitErrorMessage={bookingSubmitError}
        successMessage={successMessage}
        successCountdown={successCountdown}
        onCancel={closeModal}
        onSubmit={handleBookingSubmit}
      />
    </main>
  );
}

export default App;
