export type CellType = 'cabana' | 'pool' | 'path' | 'chalet' | 'empty';

export interface ResortMapCell {
  row: number;
  col: number;
  type: CellType;
  cabanaId?: string;
  available?: boolean;
}

export interface ResortMapData {
  rows: number;
  cols: number;
  cells: ResortMapCell[];
}

export interface BookingFormData {
  roomNumber: string;
  guestName: string;
}
