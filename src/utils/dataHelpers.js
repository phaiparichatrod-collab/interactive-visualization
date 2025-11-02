export function normalizePartyName(name) {
  if (!name) return "อื่น ๆ";
  let s = String(name).trim().replace(/\s+/g, " ").replace(/[^\u0E00-\u0E7F\sA-Za-z]/g, "");
  const rules = [
    [/ประชาธิปัตย์|ประชาธิปัตย|Democrat|DEM/i, "พรรคประชาธิปัตย์"],
    [/เพื่อไทย|Pheu\s?Thai|PT/i, "พรรคเพื่อไทย"],
    [/ภูมิใจไทย|Bhumjaithai|BJT/i, "พรรคภูมิใจไทย"],
    [/ก้าวไกล|Move\s?Forward|MFP/i, "พรรคก้าวไกล"],
    [/รวมไทย\s?สร้าง\s?ชาติ|United\s?Thai\s?Nation|UTN/i, "พรรครวมไทยสร้างชาติ"],
    [/ชาติไทย.?พัฒนา/i, "พรรคชาติไทยพัฒนา"],
    [/ไทย.?สร้าง.?ไทย/i, "พรรคไทยสร้างไทย"],
    [/กล.?้?าธรรม.?/i, "พรรคกล้าธรรม"],
    [/ประชาชาติ/i, "พรรคประชาชาติ"],
    [/เศรษฐกิจไทย/i, "พรรคเศรษฐกิจไทย"],
    [/พรรคประชาชน|ประชาชนพรรค/i, "พรรคประชาชน"],
  ];
  for (const [re, std] of rules) if (re.test(s)) return std;
  return s || "อื่น ๆ";
}

export function classifyVote(opt) {
  if (!opt) return "other";
  const o = String(opt).toLowerCase();
  if (/(ไม่เห็น|against|reject)/i.test(o)) return "no";
  if (/(เห็นชอบ|approve|for|support|pass)/i.test(o)) return "yes";
  if (/(งดออกเสียง|abstain|absent)/i.test(o)) return "other";
  return "other";
}

export function isValidName(n) {
  if (!n) return false;
  const s = String(n).trim();
  if (!/[A-Za-zก-๙]/.test(s)) return false;
  if (/^[0-9a-f-]{36}$/i.test(s)) return false;
  return s.length >= 3;
}
