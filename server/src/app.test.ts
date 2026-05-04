import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import {
  createBookingService,
  createTestResortMap,
  primaryCabanaId,
} from "./test/fixtures";

interface RunningApp {
  baseUrl: string;
  close: () => Promise<void>;
}

async function startAppServer(): Promise<RunningApp> {
  const app = createApp({
    resortMap: createTestResortMap(),
    bookingService: createBookingService(),
  });

  const server = app.listen(0);
  await once(server, "listening");

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Failed to determine test server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${(address as AddressInfo).port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

describe("createApp API routes", () => {
  it("returns health response", async () => {
    const server = await startAppServer();

    try {
      const response = await fetch(`${server.baseUrl}/api/health`);
      const payload = (await response.json()) as { status: string };

      expect(response.status).toBe(200);
      expect(payload).toEqual({ status: "ok" });
    } finally {
      await server.close();
    }
  });

  it("returns map cells with cabana availability", async () => {
    const server = await startAppServer();

    try {
      const response = await fetch(`${server.baseUrl}/api/map`);
      const payload = (await response.json()) as {
        rows: number;
        cols: number;
        cells: Array<{ cabanaId?: string; available?: boolean }>;
      };

      expect(response.status).toBe(200);
      expect(payload.rows).toBe(2);
      expect(payload.cols).toBe(2);

      const cabanaCell = payload.cells.find(
        (cell) => cell.cabanaId === primaryCabanaId,
      );
      expect(cabanaCell).toBeDefined();
      expect(cabanaCell?.available).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("books a cabana and then reports it as unavailable", async () => {
    const server = await startAppServer();

    try {
      const bookingResponse = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: "101", guestName: "Jane Doe" }),
        },
      );

      expect(bookingResponse.status).toBe(200);

      const cabanaResponse = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}`,
      );
      const cabanaPayload = (await cabanaResponse.json()) as {
        cabanaId: string;
        available: boolean;
        booking: { guestName: string } | null;
      };

      expect(cabanaResponse.status).toBe(200);
      expect(cabanaPayload.cabanaId).toBe(primaryCabanaId);
      expect(cabanaPayload.available).toBe(false);
      expect(cabanaPayload.booking).not.toBeNull();
      expect(cabanaPayload.booking?.guestName).toBe("Jane Doe");
    } finally {
      await server.close();
    }
  });

  it("returns 422 for invalid booking payload shape", async () => {
    const server = await startAppServer();

    try {
      const response = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: 101, guestName: "Jane Doe" }),
        },
      );
      const payload = (await response.json()) as { message: string };

      expect(response.status).toBe(422);
      expect(payload.message).toBe(
        "roomNumber and guestName must both be strings.",
      );
    } finally {
      await server.close();
    }
  });

  it("maps domain errors to expected status codes", async () => {
    const server = await startAppServer();

    try {
      const invalidGuestResponse = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: "101", guestName: "Wrong Name" }),
        },
      );
      expect(invalidGuestResponse.status).toBe(422);

      const firstBookingResponse = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: "101", guestName: "Jane Doe" }),
        },
      );
      expect(firstBookingResponse.status).toBe(200);

      const duplicateBookingResponse = await fetch(
        `${server.baseUrl}/api/cabanas/${encodeURIComponent(primaryCabanaId)}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: "101", guestName: "Jane Doe" }),
        },
      );
      expect(duplicateBookingResponse.status).toBe(409);

      const unknownCabanaResponse = await fetch(
        `${server.baseUrl}/api/cabanas/unknown-cabana/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber: "101", guestName: "Jane Doe" }),
        },
      );
      expect(unknownCabanaResponse.status).toBe(404);
    } finally {
      await server.close();
    }
  });

  it("returns not found payload for unknown paths", async () => {
    const server = await startAppServer();

    try {
      const response = await fetch(`${server.baseUrl}/api/does-not-exist`);
      const payload = (await response.json()) as { message: string };

      expect(response.status).toBe(404);
      expect(payload).toEqual({ message: "Resource not found." });
    } finally {
      await server.close();
    }
  });
});
