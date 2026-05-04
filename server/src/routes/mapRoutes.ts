import express from 'express';
import { BookingService } from '../domain/bookingService';
import { MapCell, ResortMap } from '../domain/mapModel';

interface ApiMapCell {
  row: number;
  col: number;
  type: MapCell['type'];
  cabanaId?: string;
  available?: boolean;
}

function toApiCell(cell: MapCell, bookingService: BookingService): ApiMapCell {
  if (!cell.cabanaId) {
    return {
      row: cell.row,
      col: cell.col,
      type: cell.type,
    };
  }

  return {
    row: cell.row,
    col: cell.col,
    type: cell.type,
    cabanaId: cell.cabanaId,
    available: bookingService.isAvailable(cell.cabanaId),
  };
}

export function createMapRouter(resortMap: ResortMap, bookingService: BookingService): any {
  const router = express.Router();

  router.get('/map', (_req: any, res: any) => {
    const cells = resortMap.cells.map((cell) => toApiCell(cell, bookingService));

    res.json({
      rows: resortMap.rows,
      cols: resortMap.cols,
      cells,
    });
  });

  return router;
}
