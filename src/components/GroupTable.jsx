import TeamTag from './TeamTag'

// Standings table for one group. Reused on the home page and team pages.
// `highlightTeam` shades that team's row; `favorite` adds the ★ marker.
export default function GroupTable({ rows, favorite, highlightTeam }) {
  return (
    <table className="standings">
      <thead>
        <tr>
          <th className="pos">#</th>
          <th className="team-col">Team</th>
          <th>MP</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>GF</th>
          <th>GA</th>
          <th>GD</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const cls = [
            i < 2 ? 'qualifying' : i === 2 ? 'maybe' : '',
            row.team === highlightTeam ? 'is-team' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <tr key={row.team} className={cls}>
              <td className="pos">{i + 1}</td>
              <td className="team-col">
                <TeamTag name={row.team} />
                {favorite === row.team && <span className="star inline">★</span>}
              </td>
              <td>{row.mp}</td>
              <td>{row.w}</td>
              <td>{row.d}</td>
              <td>{row.l}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="pts">{row.pts}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
