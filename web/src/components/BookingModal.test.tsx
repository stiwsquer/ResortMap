import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { BookingModal } from "./BookingModal";

describe("BookingModal", () => {
  function renderModal(
    overrides?: Partial<ComponentProps<typeof BookingModal>>,
  ) {
    const onCancel = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <BookingModal
        isOpen
        cabanaId="A-01"
        isSubmitting={false}
        submitErrorMessage=""
        successMessage=""
        successCountdown={null}
        onCancel={onCancel}
        onSubmit={onSubmit}
        {...overrides}
      />,
    );

    return { onCancel, onSubmit };
  }

  it("does not render when closed", () => {
    const { container } = render(
      <BookingModal
        isOpen={false}
        cabanaId=""
        isSubmitting={false}
        submitErrorMessage=""
        successMessage=""
        successCountdown={null}
        onCancel={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("validates required fields", () => {
    renderModal();

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(
      screen.getByText("Room number and guest name are required."),
    ).toBeInTheDocument();
  });

  it("submits sanitized values", () => {
    const { onSubmit } = renderModal();

    fireEvent.change(screen.getByLabelText("Room number"), {
      target: { value: "  207   " },
    });
    fireEvent.change(screen.getByLabelText("Guest name"), {
      target: { value: "  Jane    Doe  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    expect(onSubmit).toHaveBeenCalledWith({
      roomNumber: "207",
      guestName: "Jane Doe",
    });
  });

  it("renders booking confirmation mode with countdown", () => {
    renderModal({
      successMessage: "Booking confirmed for Jane.",
      successCountdown: 8,
    });

    expect(
      screen.getByRole("heading", { name: "Booking Confirmed" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Closing in 8s...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes on true outside click", () => {
    const { onCancel } = renderModal();

    const overlay = document.querySelector(".modal-overlay");
    expect(overlay).not.toBeNull();

    fireEvent.mouseDown(overlay as Element);
    fireEvent.click(overlay as Element);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not close when drag starts in dialog and ends outside", () => {
    const { onCancel } = renderModal();

    const overlay = document.querySelector(".modal-overlay");
    const dialog = screen.getByRole("dialog");

    fireEvent.mouseDown(dialog);
    fireEvent.click(overlay as Element);

    expect(onCancel).not.toHaveBeenCalled();
  });
});
