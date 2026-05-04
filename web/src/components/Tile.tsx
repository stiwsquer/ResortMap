import { ResortMapCell } from '../types';

interface TileProps {
  cell: ResortMapCell;
  onCabanaClick: (cell: ResortMapCell) => void;
}

function cabanaLabel(cell: ResortMapCell): string {
  if (!cell.cabanaId) {
    return 'Cabana';
  }

  if (cell.available) {
    return `Cabana ${cell.cabanaId} (available)`;
  }

  return `Cabana ${cell.cabanaId} (booked)`;
}

export function Tile({ cell, onCabanaClick }: TileProps): JSX.Element {
  const baseClass = `tile tile-${cell.type}`;

  if (cell.type !== 'cabana') {
    return (
      <div
        className={baseClass}
        role="img"
        aria-label={`${cell.type} tile`}
      />
    );
  }

  const cabanaClass = `${baseClass} ${cell.available ? 'tile-cabana-available' : 'tile-cabana-booked'}`;

  return (
    <button
      type="button"
      className={cabanaClass}
      onClick={() => onCabanaClick(cell)}
      aria-label={cabanaLabel(cell)}
    >
      <span className="cabana-glyph">W</span>
      <span className="cabana-state">{cell.available ? 'Available' : 'Booked'}</span>
    </button>
  );
}
