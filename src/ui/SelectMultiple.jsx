export default function SelectMultiple({ label, options = [] }) {
  return (
    <div>
      <div className="fieldlabel">{label}</div>
      <select multiple size="6" style={{ width: "240px" }}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
