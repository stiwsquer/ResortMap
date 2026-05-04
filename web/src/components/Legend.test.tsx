import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Legend } from "./Legend";

describe("Legend", () => {
  it("renders all legend labels", () => {
    render(<Legend />);

    expect(screen.getByRole("heading", { name: "Legend" })).toBeInTheDocument();
    expect(screen.getByText("Cabana")).toBeInTheDocument();
    expect(screen.getByText("Pool")).toBeInTheDocument();
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("Chalet")).toBeInTheDocument();
    expect(screen.queryByText("Empty")).not.toBeInTheDocument();
  });

  it("marks icon images as decorative", () => {
    const { container } = render(<Legend />);

    const images = container.querySelectorAll("img");
    expect(images.length).toBe(4);

    images.forEach((img: HTMLImageElement) => {
      expect(img).toHaveAttribute("alt", "");
    });
  });
});
