import { useState } from "react";
import parchmentAsset from "../../../assets/parchmentBasic.png";
import poolAsset from "../../../assets/pool.png";
import { PathTileVisual, ResortMapCell, ResortMapData } from "../types";
import { Tile } from "./Tile";

const TILE_SIZES = [16, 20, 24, 28, 32, 40, 48];
const DEFAULT_TILE_INDEX = 2;

interface PoolRegion {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface ResortGridProps {
  map: ResortMapData;
  onCabanaClick: (cell: ResortMapCell) => void;
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function resolvePathVisual(
  row: number,
  col: number,
  pathCells: Set<string>,
): PathTileVisual {
  const north = pathCells.has(cellKey(row - 1, col));
  const east = pathCells.has(cellKey(row, col + 1));
  const south = pathCells.has(cellKey(row + 1, col));
  const west = pathCells.has(cellKey(row, col - 1));

  const connectedCount =
    Number(north) + Number(east) + Number(south) + Number(west);

  if (connectedCount === 4) {
    return { asset: "crossing", rotationDeg: 0 };
  }

  if (connectedCount === 3) {
    if (!west) {
      return { asset: "split", rotationDeg: 0 };
    }

    if (!north) {
      return { asset: "split", rotationDeg: 90 };
    }

    if (!east) {
      return { asset: "split", rotationDeg: 180 };
    }

    return { asset: "split", rotationDeg: 270 };
  }

  if (connectedCount === 2) {
    if (north && south) {
      return { asset: "straight", rotationDeg: 0 };
    }

    if (east && west) {
      return { asset: "straight", rotationDeg: 90 };
    }

    if (north && east) {
      return { asset: "corner", rotationDeg: 0 };
    }

    if (east && south) {
      return { asset: "corner", rotationDeg: 90 };
    }

    if (south && west) {
      return { asset: "corner", rotationDeg: 180 };
    }

    return { asset: "corner", rotationDeg: 270 };
  }

  if (connectedCount === 1) {
    if (south) {
      return { asset: "end", rotationDeg: 0 };
    }

    if (west) {
      return { asset: "end", rotationDeg: 90 };
    }

    if (north) {
      return { asset: "end", rotationDeg: 180 };
    }

    return { asset: "end", rotationDeg: 270 };
  }

  return { asset: "end", rotationDeg: 0 };
}

function findPoolRegions(cells: ResortMapCell[]): PoolRegion[] {
  const poolSet = new Set(
    cells.filter((c) => c.type === "pool").map((c) => cellKey(c.row, c.col)),
  );
  const visited = new Set<string>();
  const regions: PoolRegion[] = [];

  for (const cell of cells) {
    if (cell.type !== "pool") {
      continue;
    }

    const key = cellKey(cell.row, cell.col);

    if (visited.has(key)) {
      continue;
    }

    let minRow = cell.row;
    let maxRow = cell.row;
    let minCol = cell.col;
    let maxCol = cell.col;
    const queue = [key];
    visited.add(key);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [r, c] = current.split(":").map(Number);
      minRow = Math.min(minRow, r);
      maxRow = Math.max(maxRow, r);
      minCol = Math.min(minCol, c);
      maxCol = Math.max(maxCol, c);

      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nk = cellKey(r + dr, c + dc);

        if (poolSet.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          queue.push(nk);
        }
      }
    }

    regions.push({ minRow, maxRow, minCol, maxCol });
  }

  return regions;
}

export function ResortGrid({
  map,
  onCabanaClick,
}: ResortGridProps): JSX.Element {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_TILE_INDEX);
  const tileSize = TILE_SIZES[sizeIndex];

  const pathCells = new Set(
    map.cells
      .filter((cell) => cell.type === "path")
      .map((cell) => cellKey(cell.row, cell.col)),
  );

  const poolRegions = findPoolRegions(map.cells);

  function zoomIn(): void {
    setSizeIndex((i) => Math.min(i + 1, TILE_SIZES.length - 1));
  }

  function zoomOut(): void {
    setSizeIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="resort-grid-wrapper">
      <div className="resort-grid-scroll">
        <div
          className="resort-grid"
          style={
            {
              "--tile-size": `${tileSize}px`,
              gridTemplateColumns: `repeat(${map.cols}, var(--tile-size))`,
              gridTemplateRows: `repeat(${map.rows}, var(--tile-size))`,
              backgroundImage: `url(${parchmentAsset})`,
            } as React.CSSProperties
          }
        >
          {map.cells.map((cell) => (
            <Tile
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              pathVisual={
                cell.type === "path"
                  ? resolvePathVisual(cell.row, cell.col, pathCells)
                  : undefined
              }
              onCabanaClick={onCabanaClick}
            />
          ))}
          {poolRegions.map((region, i) => (
            <div
              key={`pool-overlay-${i}`}
              className="pool-overlay"
              style={{
                gridRowStart: region.minRow + 1,
                gridRowEnd: region.maxRow + 2,
                gridColumnStart: region.minCol + 1,
                gridColumnEnd: region.maxCol + 2,
                backgroundImage: `url(${poolAsset})`,
              }}
              role="img"
              aria-label="Pool"
            />
          ))}
        </div>
      </div>
      <div className="zoom-controls">
        <button
          type="button"
          className="zoom-btn"
          onClick={zoomOut}
          disabled={sizeIndex === 0}
          aria-label="Zoom out"
        >
          {"\u2212"}
        </button>
        <button
          type="button"
          className="zoom-btn"
          onClick={zoomIn}
          disabled={sizeIndex === TILE_SIZES.length - 1}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
