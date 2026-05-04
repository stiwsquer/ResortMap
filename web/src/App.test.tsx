import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { bookCabana, fetchMapData } from "./api/client";
import { sampleMap } from "./test/fixtures";

vi.mock("./api/client", () => ({
  fetchMapData: vi.fn(),
  bookCabana: vi.fn(),
}));

const mockedFetchMapData = vi.mocked(fetchMapData);
const mockedBookCabana = vi.mocked(bookCabana);

beforeEach(() => {
  mockedFetchMapData.mockReset();
  mockedBookCabana.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("loads and renders map with availability count", async () => {
    mockedFetchMapData.mockResolvedValueOnce(sampleMap);

    render(<App />);

    expect(screen.getByText("Loading map...")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Resort map" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Available cabanas: 1")).toBeInTheDocument();
  });

  it("shows map-load error and retries successfully", async () => {
    mockedFetchMapData
      .mockRejectedValueOnce(new Error("Map API unavailable"))
      .mockResolvedValueOnce(sampleMap);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Map API unavailable",
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry loading map" }));

    expect(
      await screen.findByRole("region", { name: "Resort map" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockedFetchMapData).toHaveBeenCalledTimes(2);
  });

  it("shows unavailable cabana toast and auto-hides it", async () => {
    mockedFetchMapData.mockResolvedValueOnce(sampleMap);

    render(<App />);

    const bookedCabanaButton = await screen.findByRole("button", {
      name: "Cabana A-02 (booked)",
    });

    vi.useFakeTimers();
    fireEvent.click(bookedCabanaButton);

    expect(
      screen.getByText(
        "This cabana is currently unavailable. Please choose another one.",
      ),
    ).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.queryByText(
        "This cabana is currently unavailable. Please choose another one.",
      ),
    ).not.toBeInTheDocument();
  });

  it("submits booking, shows success countdown, and auto-closes modal", async () => {
    const refreshedMap = {
      ...sampleMap,
      cells: sampleMap.cells.map((cell) =>
        cell.cabanaId === "A-01" ? { ...cell, available: false } : cell,
      ),
    };

    mockedFetchMapData
      .mockResolvedValueOnce(sampleMap)
      .mockResolvedValueOnce(refreshedMap);
    mockedBookCabana.mockResolvedValueOnce({
      message: "ok",
      booking: {
        cabanaId: "A-01",
        roomNumber: "207",
        guestName: "Jane Doe",
        bookedAt: new Date().toISOString(),
      },
    });

    render(<App />);

    const availableCabanaButton = await screen.findByRole("button", {
      name: "Cabana A-01 (available)",
    });

    fireEvent.click(availableCabanaButton);

    fireEvent.change(screen.getByLabelText("Room number"), {
      target: { value: "207" },
    });
    fireEvent.change(screen.getByLabelText("Guest name"), {
      target: { value: "Jane Doe" },
    });

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockedBookCabana).toHaveBeenCalledWith("A-01", {
      roomNumber: "207",
      guestName: "Jane Doe",
    });

    expect(screen.getByText("Closing in 10s...")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Closing in\s*9/)).toBeInTheDocument();

    for (let i = 0; i < 10; i += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await act(async () => {
        await Promise.resolve();
      });
    }

    expect(mockedFetchMapData).toHaveBeenCalledTimes(2);
    expect(mockedBookCabana).toHaveBeenCalledTimes(1);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows booking API error in modal", async () => {
    mockedFetchMapData.mockResolvedValueOnce(sampleMap);
    mockedBookCabana.mockRejectedValueOnce(
      new Error("Guest name does not match room"),
    );

    render(<App />);

    await screen.findByRole("region", { name: "Resort map" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Cabana A-01 (available)" }),
    );

    fireEvent.change(screen.getByLabelText("Room number"), {
      target: { value: "207" },
    });
    fireEvent.change(screen.getByLabelText("Guest name"), {
      target: { value: "Wrong Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    expect(
      await screen.findByText("Guest name does not match room"),
    ).toBeInTheDocument();
  });
});
