export type MapSymbol = 'W' | 'p' | '#' | 'c' | '.';

export type TileType = 'cabana' | 'pool' | 'path' | 'chalet' | 'empty';

export interface MapCell {
  row: number;
  col: number;
  symbol: MapSymbol;
  type: TileType;
  cabanaId?: string;
}

export interface ResortMap {
  rows: number;
  cols: number;
  cells: MapCell[];
  cabanaIds: string[];
}

const SYMBOL_TO_TILE_TYPE: Record<MapSymbol, TileType> = {
  W: 'cabana',
  p: 'pool',
  '#': 'path',
  c: 'chalet',
  '.': 'empty',
};

export function toTileType(symbol: MapSymbol): TileType {
  return SYMBOL_TO_TILE_TYPE[symbol];
}

export function createCabanaId(row: number, col: number): string {
  return `cabana-r${row + 1}-c${col + 1}`;
}
