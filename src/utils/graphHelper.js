import * as d3 from 'd3';

export function dominantToneColor(counts) {
  const total = (counts.yes || 0) + (counts.no || 0) + (counts.other || 0);
  if (!total) return "#bbb";
  const pYes = (counts.yes || 0) / total;
  const pNo = (counts.no || 0) / total;
  const pOth = (counts.other || 0) / total;
  const maxP = Math.max(pYes, pNo, pOth);
  
  const yesLight = "#76c679", yesDark = "#2ca02c";
  const noLight = "#e86a6a", noDark = "#d62728";
  const otLight = "#bdbdbd", otDark = "#666666";
  
  if (maxP === pYes) return d3.interpolateRgb(yesLight, yesDark)(maxP);
  if (maxP === pNo) return d3.interpolateRgb(noLight, noDark)(maxP);
  return d3.interpolateRgb(otLight, otDark)(maxP);
}

export function fitToContentsStatic(svg, nodes, padding = 40) {
  if (!nodes.length) return;
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const W = svg.node().clientWidth;
  const H = svg.node().clientHeight;
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const k = Math.min(W / width, H / height);
  const tx = (W - k * (minX + maxX)) / 2;
  const ty = (H - k * (minY + maxY)) / 2;
  const root = svg.select("g.root");
  root.attr("transform", `translate(${tx},${ty}) scale(${k})`);
}

export function buildMpPartyCanonical(voteEvents, normalizePartyName, isValidName) {
  const counter = new Map();
  
  (voteEvents || []).forEach(ev => {
    (ev.votes || []).forEach(v => {
      if (!isValidName(v.voter_name)) return;
      const nm = String(v.voter_name).trim();
      const p = normalizePartyName(v.voter_party);
      if (!counter.has(nm)) counter.set(nm, new Map());
      const m = counter.get(nm);
      m.set(p, (m.get(p) || 0) + 1);
    });
  });
  
  const mpPartyCanon = new Map();
  counter.forEach((m, name) => {
    let bestParty = "อื่นๆ", best = -1;
    m.forEach((cnt, party) => {
      if (cnt > best) {
        best = cnt;
        bestParty = party;
      }
    });
    mpPartyCanon.set(name, bestParty);
  });
  
  return mpPartyCanon;
}