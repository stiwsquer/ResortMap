export function Legend(): JSX.Element {
  return (
    <section className="legend" aria-label="Map legend">
      <h2>Legend</h2>
      <ul>
        <li><span className="legend-chip legend-cabana" /> Cabana (`W`)</li>
        <li><span className="legend-chip legend-pool" /> Pool (`p`)</li>
        <li><span className="legend-chip legend-path" /> Path (`#`)</li>
        <li><span className="legend-chip legend-chalet" /> Chalet (`c`)</li>
        <li><span className="legend-chip legend-empty" /> Empty (`.`)</li>
      </ul>
    </section>
  );
}
