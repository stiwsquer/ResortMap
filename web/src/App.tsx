import { useEffect, useMemo, useState } from "react";
import { bookCabana, fetchMapData } from "./api/client";
import { BookingModal } from "./components/BookingModal";
import { Legend } from "./components/Legend";
import { ResortGrid } from "./components/ResortGrid";
import { BookingFormData, ResortMapCell, ResortMapData } from "./types";
import "./styles/app.css";

export function App(): JSX.Element {
  const [mapData, setMapData] = useState<ResortMapData | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState("");
  const [selectedCabana, setSelectedCabana] = useState<ResortMapCell | null>(
    null,
  );
  const [infoMessage, setInfoMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function refreshMap(): Promise<ResortMapData> {
    const data = await fetchMapData();
    setMapData(data);
    return data;
  }

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      try {
        const data = await fetchMapData();

        if (!isMounted) {
          return;
        }

        setMapData(data);
        setInfoMessage("");
      } catch {
        if (!isMounted) {
          return;
        }

        setInfoMessage("Unable to load live map data. Please retry.");
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

    if (!cell.available) {
      setInfoMessage(
        "This cabana is currently unavailable. Please choose another one.",
      );
      return;
    }

    setInfoMessage("");
    setSelectedCabana(cell);
  }

  function closeModal(): void {
    setSelectedCabana(null);
    setBookingSubmitError("");
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
      await refreshMap();

      setSelectedCabana(null);
      setInfoMessage("");
      setSuccessMessage(
        `Booking confirmed for ${formData.guestName} (room ${formData.roomNumber}) at ${cabanaId}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Booking failed. Please try again.";

      setBookingSubmitError(message);
      setSuccessMessage("");
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Resort Cabana Map</h1>
          <p className="header-subtitle">
            Interactive map with live API availability and booking.
          </p>
        </div>
        <p className="availability-pill">Available cabanas: {availableCount}</p>
      </header>

      <Legend />

      {isLoadingMap ? (
        <p className="message message-info">Loading map...</p>
      ) : null}

      {infoMessage ? (
        <p className="message message-info">{infoMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="message message-success">{successMessage}</p>
      ) : null}

      {mapData ? (
        <ResortGrid map={mapData} onCabanaClick={handleCabanaClick} />
      ) : null}

      <BookingModal
        isOpen={Boolean(selectedCabana?.cabanaId)}
        cabanaId={selectedCabana?.cabanaId ?? ""}
        isSubmitting={isSubmittingBooking}
        submitErrorMessage={bookingSubmitError}
        onCancel={closeModal}
        onSubmit={handleBookingSubmit}
      />
    </main>
  );
}

export default App;
