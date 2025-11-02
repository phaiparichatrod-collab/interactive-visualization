export const DATA_URL =
  "https://raw.githubusercontent.com/phaiparichatrod-collab/interactive-visualization/refs/heads/feat/ns-chart/src/data_event_network.json";

export const PARTY_COLOR = {
  "พรรคภูมิใจไทย": "#1E2F97",
  "พรรคประชาธิปัตย์": "#00A3E0",
  "พรรคประชาชน": "#FF6A00",
  "พรรคเพื่อไทย": "#E60012",
  "พรรคกล้าธรรม": "#008000",
  "พรรครวมไทยสร้างชาติ": "#002060",
  "พรรคชาติไทยพัฒนา": "#FF66B3",
  "พรรคก้าวไกล": "#EF771E",
  "พรรคไทยสร้างไทย": "#65408F",
  "พรรคประชาชาติ": "#009688",
  "พรรคเศรษฐกิจไทย": "#FFD700",
};

export const partyColor = (p) => PARTY_COLOR[p] || "#bbbbbb";

export const VOTE_COLOR = (v) =>
  v === "yes" ? "#2ca02c" : v === "no" ? "#d62728" : "#999";
