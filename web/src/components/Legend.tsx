import cabanaAsset from "../../../assets/cabana.png";
import chaletAsset from "../../../assets/houseChimney.png";
import parchmentAsset from "../../../assets/parchmentBasic.png";
import poolAsset from "../../../assets/pool.png";
import arrowStraightAsset from "../../../assets/arrowStraight.png";

export function Legend(): JSX.Element {
  return (
    <section className="legend" aria-label="Map legend">
      <h2>Legend</h2>
      <ul>
        <li>
          <img className="legend-chip" src={cabanaAsset} alt="" /> Cabana
        </li>
        <li>
          <img
            className="legend-chip legend-chip-pool"
            src={poolAsset}
            alt=""
          />{" "}
          Pool
        </li>
        <li>
          <img
            className="legend-chip legend-chip-path"
            src={arrowStraightAsset}
            alt=""
          />{" "}
          Path
        </li>
        <li>
          <img
            className="legend-chip legend-chip-chalet"
            src={chaletAsset}
            alt=""
          />{" "}
          Chalet
        </li>
        <li>
          <img
            className="legend-chip legend-chip-empty"
            src={parchmentAsset}
            alt=""
          />{" "}
          Empty
        </li>
      </ul>
    </section>
  );
}
