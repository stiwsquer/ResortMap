import { ResortMapCell, ResortMapData } from "../types";

export const sampleCells: ResortMapCell[] = [
  { row: 0, col: 0, type: "cabana", cabanaId: "A-01", available: true },
  { row: 0, col: 1, type: "cabana", cabanaId: "A-02", available: false },
  { row: 0, col: 2, type: "pool" },
  { row: 1, col: 0, type: "path" },
  { row: 1, col: 1, type: "chalet" },
  { row: 1, col: 2, type: "empty" },
];

export const sampleMap: ResortMapData = {
  rows: 2,
  cols: 3,
  cells: sampleCells,
};

export const rectangularPoolMap: ResortMapData = {
  rows: 2,
  cols: 2,
  cells: [
    { row: 0, col: 0, type: "pool" },
    { row: 0, col: 1, type: "pool" },
    { row: 1, col: 0, type: "pool" },
    { row: 1, col: 1, type: "pool" },
  ],
};

export const nonRectangularPoolMap: ResortMapData = {
  rows: 2,
  cols: 2,
  cells: [
    { row: 0, col: 0, type: "pool" },
    { row: 0, col: 1, type: "pool" },
    { row: 1, col: 0, type: "pool" },
  ],
};
