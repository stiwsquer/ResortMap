import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tile } from "./Tile";

describe("Tile", () => {
  it("renders non-cabana tile as image role", () => {
    render(
      <Tile
        cell={{ row: 1, col: 2, type: "pool" }}
        onCabanaClick={() => undefined}
      />,
    );

    expect(screen.getByRole("img", { name: "pool tile" })).toBeInTheDocument();
  });

  it("renders available cabana as interactive button and triggers callback", () => {
    const onCabanaClick = vi.fn();

    render(
      <Tile
        cell={{ row: 0, col: 0, type: "cabana", cabanaId: "A-01", available: true }}
        onCabanaClick={onCabanaClick}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Cabana A-01 (available)",
    });

    expect(button).toHaveClass("tile-cabana-available");
    fireEvent.click(button);

    expect(onCabanaClick).toHaveBeenCalledTimes(1);
    expect(onCabanaClick).toHaveBeenCalledWith({
      row: 0,
      col: 0,
      type: "cabana",
      cabanaId: "A-01",
      available: true,
    });
  });

  it("renders booked cabana with booked label and style", () => {
    render(
      <Tile
        cell={{ row: 0, col: 1, type: "cabana", cabanaId: "A-02", available: false }}
        onCabanaClick={() => undefined}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Cabana A-02 (booked)",
    });

    expect(button).toHaveClass("tile-cabana-booked");
  });
});
