import { describe, expect, it } from "vitest";
import { createCabanaId } from "../domain/mapModel";
import { MapLoadError, parseAsciiMap } from "./mapLoader";

describe("parseAsciiMap", () => {
  it("parses valid map into cells and cabana ids", () => {
    const map = parseAsciiMap("W#\np.");

    expect(map.rows).toBe(2);
    expect(map.cols).toBe(2);
    expect(map.cells).toHaveLength(4);
    expect(map.cabanaIds).toEqual([createCabanaId(0, 0)]);
    expect(map.cells[0]).toMatchObject({
      row: 0,
      col: 0,
      symbol: "W",
      type: "cabana",
      cabanaId: createCabanaId(0, 0),
    });
  });

  it("throws when map is empty", () => {
    expect(() => parseAsciiMap("")).toThrowError(MapLoadError);
  });

  it("throws on inconsistent row lengths", () => {
    expect(() => parseAsciiMap("W#\np")).toThrowError(MapLoadError);
  });

  it("throws on unsupported symbols", () => {
    expect(() => parseAsciiMap("W?\np." )).toThrowError(MapLoadError);
  });
});
