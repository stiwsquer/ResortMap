import arrowCornerSquareAsset from "../../../assets/arrowCornerSquare.png";
import arrowCrossingAsset from "../../../assets/arrowCrossing.png";
import arrowEndAsset from "../../../assets/arrowEnd.png";
import arrowSplitAsset from "../../../assets/arrowSplit.png";
import arrowStraightAsset from "../../../assets/arrowStraight.png";
import cabanaAsset from "../../../assets/cabana.png";
import chaletAsset from "../../../assets/houseChimney.png";
import waterTextureAsset from "../../../assets/textureWater.png";
import { PathTileAsset, PathTileVisual, ResortMapCell } from "../types";

interface TileProps {
  cell: ResortMapCell;
  pathVisual?: PathTileVisual;
  onCabanaClick: (cell: ResortMapCell) => void;
}

const pathAssetByVariant: Record<PathTileAsset, string> = {
  straight: arrowStraightAsset,
  corner: arrowCornerSquareAsset,
  end: arrowEndAsset,
  split: arrowSplitAsset,
  crossing: arrowCrossingAsset,
};

function createTileStyle(
  cell: ResortMapCell,
  pathVisual?: PathTileVisual,
): Record<string, string> {
  const base: Record<string, string> = {
    gridRow: String(cell.row + 1),
    gridColumn: String(cell.col + 1),
  };

  if (cell.type === "empty") {
    return base;
  }

  if (cell.type === "pool") {
    return { ...base, backgroundImage: `url(${waterTextureAsset})` };
  }

  if (cell.type === "chalet") {
    return { ...base, backgroundImage: `url(${chaletAsset})` };
  }

  if (cell.type === "path") {
    const visual = pathVisual ?? { asset: "end", rotationDeg: 0 };

    return {
      ...base,
      backgroundImage: `url(${pathAssetByVariant[visual.asset]})`,
      transform: `rotate(${visual.rotationDeg}deg)`,
    };
  }

  return { ...base, backgroundImage: `url(${cabanaAsset})` };
}

function cabanaLabel(cell: ResortMapCell): string {
  if (!cell.cabanaId) {
    return "Cabana";
  }

  if (cell.available) {
    return `Cabana ${cell.cabanaId} (available)`;
  }

  return `Cabana ${cell.cabanaId} (booked)`;
}

export function Tile({
  cell,
  pathVisual,
  onCabanaClick,
}: TileProps): JSX.Element {
  const baseClass = `tile tile-${cell.type}`;
  const tileStyle = createTileStyle(cell, pathVisual);

  if (cell.type !== "cabana") {
    return (
      <div
        className={baseClass}
        style={tileStyle}
        role="img"
        aria-label={`${cell.type} tile`}
      />
    );
  }

  const cabanaClass = `${baseClass} ${cell.available ? "tile-cabana-available" : "tile-cabana-booked"}`;

  return (
    <button
      type="button"
      className={cabanaClass}
      style={tileStyle}
      onClick={() => onCabanaClick(cell)}
      aria-label={cabanaLabel(cell)}
    />
  );
}
