import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRuntimeConfig } from "./config";

describe("getRuntimeConfig", () => {
  it("uses default map and bookings paths when args are absent", () => {
    const config = getRuntimeConfig([]);

    expect(config.mapPath).toBe(path.resolve("map.ascii"));
    expect(config.bookingsPath).toBe(path.resolve("bookings.json"));
    expect(config.port).toBe(3000);
  });

  it("uses provided --map and --bookings values", () => {
    const config = getRuntimeConfig([
      "--map",
      "./fixtures/custom-map.ascii",
      "--bookings",
      "./fixtures/custom-bookings.json",
    ]);

    expect(config.mapPath).toBe(path.resolve("./fixtures/custom-map.ascii"));
    expect(config.bookingsPath).toBe(
      path.resolve("./fixtures/custom-bookings.json"),
    );
  });

  it("throws when --map value is missing", () => {
    expect(() => getRuntimeConfig(["--map"])) .toThrowError(
      "Missing value for --map.",
    );
  });

  it("throws when --bookings value is missing", () => {
    expect(() => getRuntimeConfig(["--bookings"])) .toThrowError(
      "Missing value for --bookings.",
    );
  });
});
