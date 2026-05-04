import { readFile } from 'node:fs/promises';
import {
  createCabanaId,
  MapCell,
  MapSymbol,
  ResortMap,
  toTileType,
} from '../domain/mapModel';

const ALLOWED_SYMBOLS = new Set<MapSymbol>(['W', 'p', '#', 'c', '.']);
const MAX_ROWS = 200;
const MAX_COLS = 200;

export class MapLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MapLoadError';
  }
}

function normalizeLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

export function parseAsciiMap(raw: string): ResortMap {
  const lines = normalizeLines(raw);

  if (lines.length === 0) {
    throw new MapLoadError('Invalid map format: map cannot be empty.');
  }

  if (lines.length > MAX_ROWS) {
    throw new MapLoadError(
      `Invalid map format: row count ${lines.length} exceeds limit ${MAX_ROWS}.`
    );
  }

  const cols = lines[0].length;

  if (cols === 0) {
    throw new MapLoadError('Invalid map format: map rows cannot be empty.');
  }

  if (cols > MAX_COLS) {
    throw new MapLoadError(
      `Invalid map format: column count ${cols} exceeds limit ${MAX_COLS}.`
    );
  }

  const cells: MapCell[] = [];
  const cabanaIds: string[] = [];

  lines.forEach((line, row) => {
    if (line.length !== cols) {
      throw new MapLoadError(
        `Invalid map format: inconsistent row length at line ${row + 1}. Expected ${cols}, got ${line.length}.`
      );
    }

    for (let col = 0; col < cols; col += 1) {
      const symbol = line[col] as MapSymbol;

      if (!ALLOWED_SYMBOLS.has(symbol)) {
        throw new MapLoadError(
          `Invalid map format: unsupported symbol '${line[col]}' at line ${row + 1}, column ${col + 1}.`
        );
      }

      const cell: MapCell = {
        row,
        col,
        symbol,
        type: toTileType(symbol),
      };

      if (symbol === 'W') {
        const cabanaId = createCabanaId(row, col);
        cell.cabanaId = cabanaId;
        cabanaIds.push(cabanaId);
      }

      cells.push(cell);
    }
  });

  return {
    rows: lines.length,
    cols,
    cells,
    cabanaIds,
  };
}

export async function loadMapFromFile(filePath: string): Promise<ResortMap> {
  let raw: string;

  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown file read error.';
    throw new MapLoadError(`Failed to read map file (${filePath}): ${message}`);
  }

  return parseAsciiMap(raw);
}
