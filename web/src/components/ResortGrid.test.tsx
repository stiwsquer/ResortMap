import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  nonRectangularPoolMap,
  rectangularPoolMap,
  sampleMap,
} from "../test/fixtures";
import { ResortGrid } from "./ResortGrid";

describe("ResortGrid", () => {
  it("renders map region, cabana buttons, and supports cabana click", () => {
    const onCabanaClick = vi.fn();
    render(<ResortGrid map={sampleMap} onCabanaClick={onCabanaClick} />);

    const region = screen.getByRole("region", { name: "Resort map" });
    expect(region).toBeInTheDocument();

    const availableCabana = screen.getByRole("button", {
      name: "Cabana A-01 (available)",
    });

    fireEvent.click(availableCabana);
    expect(onCabanaClick).toHaveBeenCalledTimes(1);
  });

  it("renders pool overlay only for rectangular pool regions", () => {
    const { rerender } = render(
      <ResortGrid
        map={rectangularPoolMap}
        onCabanaClick={() => undefined}
      />,
    );

    expect(screen.getAllByRole("img", { name: "Pool" }).length).toBe(1);

    rerender(
      <ResortGrid
        map={nonRectangularPoolMap}
        onCabanaClick={() => undefined}
      />,
    );

    expect(screen.queryByRole("img", { name: "Pool" })).not.toBeInTheDocument();
  });

  it("handles zoom controls and disables buttons at bounds", () => {
    render(<ResortGrid map={sampleMap} onCabanaClick={() => undefined} />);

    const zoomOut = screen.getByRole("button", { name: "Zoom out" });
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });

    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);

    expect(zoomOut).toBeDisabled();
    expect(zoomIn).not.toBeDisabled();

    for (let i = 0; i < 6; i += 1) {
      fireEvent.click(zoomIn);
    }

    expect(zoomIn).toBeDisabled();
  });

  it("renders each provided map cell tile", () => {
    render(<ResortGrid map={sampleMap} onCabanaClick={() => undefined} />);

    const resortRegion = screen.getByRole("region", { name: "Resort map" });
    expect(within(resortRegion).getAllByRole("img").length).toBeGreaterThan(0);
  });
});
