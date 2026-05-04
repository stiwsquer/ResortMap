import { ResortMapCell, ResortMapData } from '../types';
import { Tile } from './Tile';

interface ResortGridProps {
  map: ResortMapData;
  onCabanaClick: (cell: ResortMapCell) => void;
}

export function ResortGrid({ map, onCabanaClick }: ResortGridProps): JSX.Element {
  return (
    <div className="resort-grid-scroll">
      <div
        className="resort-grid"
        style={{
          gridTemplateColumns: `repeat(${map.cols}, var(--tile-size))`,
          gridTemplateRows: `repeat(${map.rows}, var(--tile-size))`,
        }}
      >
        {map.cells.map((cell) => (
          <Tile
            key={`${cell.row}-${cell.col}`}
            cell={cell}
            onCabanaClick={onCabanaClick}
          />
        ))}
      </div>
    </div>
  );
}
